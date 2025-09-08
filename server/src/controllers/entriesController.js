const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a new entry (Movie / TV Show).
 * - Sets status = PENDING and approved = false.
 * - Only authenticated users call this (req.user set by middleware).
 */
exports.createEntry = async (req, res) => {
  try {
    const payload = req.body;
    const creatorId = req.user && req.user.id;
    if (!creatorId) return res.status(401).json({ message: 'Unauthorized' });

    const entry = await prisma.entry.create({
      data: {
        title: payload.title,
        type: payload.type === 'TV Show' || payload.type === 'TV_SHOW' ? 'TV_SHOW' : 'MOVIE',
        director: payload.director || null,
        budget: payload.budget || null,
        location: payload.location || null,
        duration: payload.duration || null,
        yearTime: payload.year_time || payload.yearTime || null,
        description: payload.description || null,
        posterUrl: payload.posterUrl || null,
        thumbUrl: payload.thumbUrl || null,
        createdById: creatorId,
        status: 'PENDING',
        approved: false
      }
    });

    return res.status(201).json(entry);
  } catch (err) {
    console.error('createEntry err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * List entries with filters, sorting and cursor pagination for infinite scroll.
 * - Public users see only approved entries.
 * - If query ?mine=true and authenticated, return owner's entries including PENDING.
 */
exports.listEntries = async (req, res) => {
  try {
    const {
      q, director, type, year_from, year_to, sort, limit = 15, cursor, mine
    } = req.query;

    const take = Math.min(parseInt(limit, 10) || 15, 50);
    const where = {};

    // If user wants their own items
    if (mine === 'true' && req.user) {
      where.createdById = req.user.id;
    } else {
      // Only approved visible to others
      where.approved = true;
      where.status = 'APPROVED';
    }

    if (director) where.director = { contains: director, mode: 'insensitive' };
    if (type) {
      const mapType = type.toLowerCase().startsWith('tv') ? 'TV_SHOW' : 'MOVIE';
      where.type = mapType;
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { director: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (year_from || year_to) {
      // yearTime is a string; best-effort numeric parse from start of string
      // This is a simple filter — for production, store numeric year field.
      where.AND = [
        ...(where.AND || []),
        {
          yearTime: {
            not: null
          }
        }
      ];
      // We'll filter in JS after fetch for year range if needed.
    }

    // Sorting: example "title:asc,createdAt:desc"
    let orderBy = { createdAt: 'desc' };
    if (sort) {
      const [fieldDir] = sort.split(',');
      const [field, dir] = fieldDir.split(':');
      const map = {
        title: 'title',
        createdAt: 'createdAt',
        year: 'yearTime'
      };
      if (map[field]) orderBy = { [map[field]]: dir === 'asc' ? 'asc' : 'desc' };
    }

    // Cursor pagination (cursor = last id)
    const queryOptions = {
      where,
      take: take + 1,
      orderBy
    };

    if (cursor) {
      queryOptions.cursor = { id: parseInt(cursor, 10) };
      queryOptions.skip = 1;
    }

    const rows = await prisma.entry.findMany(queryOptions);

    // Next cursor logic
    let nextCursor = null;
    if (rows.length > take) {
      const next = rows[rows.length - 1];
      nextCursor = String(next.id);
      rows.pop();
    }

    // Basic year filtering in JS if requested
    let filtered = rows;
    if ((year_from || year_to)) {
      const from = year_from ? parseInt(year_from, 10) : Number.MIN_SAFE_INTEGER;
      const to = year_to ? parseInt(year_to, 10) : Number.MAX_SAFE_INTEGER;
      filtered = rows.filter(r => {
        if (!r.yearTime) return false;
        const match = r.yearTime.match(/\d{4}/);
        if (!match) return false;
        const y = parseInt(match[0], 10);
        return y >= from && y <= to;
      });
    }

    return res.json({ items: filtered, nextCursor });
  } catch (err) {
    console.error('listEntries err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getEntry = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const entry = await prisma.entry.findUnique({ where: { id } });
    if (!entry) return res.status(404).json({ message: 'Not found' });

    // If not approved and requester is neither admin nor owner, deny
    if (!entry.approved) {
      if (!req.user) return res.status(403).json({ message: 'Forbidden' });
      if (req.user.role !== 'ADMIN' && req.user.id !== entry.createdById) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    return res.json(entry);
  } catch (err) {
    console.error('getEntry err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
  const existing = await prisma.entry.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Not found' });

  // Only owner or admin
  if (req.user.role !== 'ADMIN' && req.user.id !== existing.createdById) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const payload = req.body;
  const updated = await prisma.entry.update({
    where: { id },
    data: {
      title: payload.title ?? existing.title,
      director: payload.director ?? existing.director,
      budget: payload.budget ?? existing.budget,
      location: payload.location ?? existing.location,
      duration: payload.duration ?? existing.duration,
      yearTime: payload.year_time ?? payload.yearTime ?? existing.yearTime,
      description: payload.description ?? existing.description,
      posterUrl: payload.posterUrl ?? existing.posterUrl,
      thumbUrl: payload.thumbUrl ?? existing.thumbUrl,
      // If an owner edits, set status back to PENDING (so admin re-approves)
      status: req.user.role === 'ADMIN' ? existing.status : 'PENDING',
      approved: req.user.role === 'ADMIN' ? existing.approved : false
    }
  });

  return res.json(updated);
  } catch (err) {
    console.error('updateEntry err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.entry.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    if (req.user.role !== 'ADMIN' && req.user.id !== existing.createdById) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Soft delete: set deletedAt
    const deleted = await prisma.entry.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return res.json({ message: 'Deleted', id: deleted.id });
  } catch (err) {
    console.error('deleteEntry err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.approveEntry = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const existing = await prisma.entry.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    const updated = await prisma.entry.update({
      where: { id },
      data: {
        status,
        approved: status === 'APPROVED'
      }
    });

    return res.json(updated);
  } catch (err) {
    console.error('approveEntry err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
