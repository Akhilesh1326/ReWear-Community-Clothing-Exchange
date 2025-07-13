const { v4: uuidv4 } = require('uuid')

// Helper function to log admin actions
const logAdminAction = async (pgClient, adminId, action, targetType, targetId, details = {}) => {
  try {
    await pgClient.query(
      'INSERT INTO ADMIN_LOGS (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
      [adminId, action, targetType, targetId, JSON.stringify(details)]
    )
  } catch (error) {
    console.error('Failed to log admin action:', error)
  }
}

// User Management Controllers
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', sortBy = 'created_at', sortOrder = 'DESC' } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT user_id, email, first_name, last_name, username, phone, 
             address, city, state, points_balance, user_type, is_active, 
             email_verified, created_at, updated_at
      FROM USERS 
      WHERE 1=1
    `
    let countQuery = 'SELECT COUNT(*) FROM USERS WHERE 1=1'
    const queryParams = []
    let paramIndex = 1

    // Add search functionality
    if (search) {
      const searchCondition = ` AND (
        first_name ILIKE $${paramIndex} OR 
        last_name ILIKE $${paramIndex} OR 
        email ILIKE $${paramIndex} OR 
        username ILIKE $${paramIndex}
      )`
      query += searchCondition
      countQuery += searchCondition
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    // Add sorting
    const validSortColumns = ['created_at', 'first_name', 'last_name', 'email', 'points_balance']
    const validSortOrders = ['ASC', 'DESC']
    
    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder.toUpperCase())) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`
    }

    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    queryParams.push(limit, offset)

    const [usersResult, countResult] = await Promise.all([
      req.pgClient.query(query, queryParams),
      req.pgClient.query(countQuery, search ? [`%${search}%`] : [])
    ])

    const users = usersResult.rows.map(user => ({
      id: user.user_id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      email: user.email,
      status: user.is_active ? 'Active' : 'Inactive',
      joined: user.created_at.toISOString().split('T')[0],
      points: user.points_balance,
      userType: user.user_type,
      ...user
    }))

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
        totalUsers: parseInt(countResult.rows[0].count),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Get all users error:', error)
    res.status(500).json({ message: 'Failed to fetch users' })
  }
}

const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const result = await req.pgClient.query(
      'SELECT * FROM USERS WHERE user_id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const user = result.rows[0]
    res.json({
      id: user.user_id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      email: user.email,
      status: user.is_active ? 'Active' : 'Inactive',
      joined: user.created_at.toISOString().split('T')[0],
      points: user.points_balance,
      ...user
    })
  } catch (error) {
    console.error('Get user by ID error:', error)
    res.status(500).json({ message: 'Failed to fetch user' })
  }
}

const createUser = async (req, res) => {
  try {
    const { name, email, status, points = 0, userType = 'standard' } = req.body
    const [firstName, ...lastNameParts] = name.split(' ')
    const lastName = lastNameParts.join(' ')
    
    const userId = uuidv4()
    const isActive = status === 'Active'

    const result = await req.pgClient.query(
      `INSERT INTO USERS (user_id, email, first_name, last_name, points_balance, user_type, is_active, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, email, firstName, lastName, points, userType, isActive, true]
    )

    await logAdminAction(req.pgClient, req.user.userId, 'CREATE_USER', 'user', userId, { email, name })

    const user = result.rows[0]
    res.status(201).json({
      id: user.user_id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      email: user.email,
      status: user.is_active ? 'Active' : 'Inactive',
      joined: user.created_at.toISOString().split('T')[0],
      points: user.points_balance
    })
  } catch (error) {
    console.error('Create user error:', error)
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ message: 'Email already exists' })
    }
    res.status(500).json({ message: 'Failed to create user' })
  }
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, status, points } = req.body
    const [firstName, ...lastNameParts] = name.split(' ')
    const lastName = lastNameParts.join(' ')
    const isActive = status === 'Active'

    const result = await req.pgClient.query(
      `UPDATE USERS 
       SET first_name = $1, last_name = $2, email = $3, is_active = $4, points_balance = $5, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $6 RETURNING *`,
      [firstName, lastName, email, isActive, points, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    await logAdminAction(req.pgClient, req.user.userId, 'UPDATE_USER', 'user', id, { name, email, status, points })

    const user = result.rows[0]
    res.json({
      id: user.user_id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      email: user.email,
      status: user.is_active ? 'Active' : 'Inactive',
      joined: user.created_at.toISOString().split('T')[0],
      points: user.points_balance
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ message: 'Failed to update user' })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    
    // Check if user exists
    const userCheck = await req.pgClient.query('SELECT email FROM USERS WHERE user_id = $1', [id])
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Delete user (CASCADE will handle related records)
    await req.pgClient.query('DELETE FROM USERS WHERE user_id = $1', [id])
    
    // Delete related items from MongoDB
    await req.mongoDb.collection('items').deleteMany({ userId: id })
    await req.mongoDb.collection('itemImages').deleteMany({ 
      itemId: { $in: await req.mongoDb.collection('items').distinct('itemId', { userId: id }) }
    })
    await req.mongoDb.collection('notifications').deleteMany({ userId: id })

    await logAdminAction(req.pgClient, req.user.userId, 'DELETE_USER', 'user', id, { email: userCheck.rows[0].email })

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ message: 'Failed to delete user' })
  }
}

const suspendUser = async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await req.pgClient.query(
      'UPDATE USERS SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING email',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    await logAdminAction(req.pgClient, req.user.userId, 'SUSPEND_USER', 'user', id, { email: result.rows[0].email })

    res.json({ message: 'User suspended successfully' })
  } catch (error) {
    console.error('Suspend user error:', error)
    res.status(500).json({ message: 'Failed to suspend user' })
  }
}

const activateUser = async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await req.pgClient.query(
      'UPDATE USERS SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING email',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    await logAdminAction(req.pgClient, req.user.userId, 'ACTIVATE_USER', 'user', id, { email: result.rows[0].email })

    res.json({ message: 'User activated successfully' })
  } catch (error) {
    console.error('Activate user error:', error)
    res.status(500).json({ message: 'Failed to activate user' })
  }
}

// Order/Swap Management Controllers
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', sortBy = 'created_at', sortOrder = 'DESC' } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT s.swap_id, s.swap_type, s.status, s.points_used, s.created_at, s.completed_at,
             u1.first_name || ' ' || u1.last_name as requester_name,
             u2.first_name || ' ' || u2.last_name as owner_name,
             s.message
      FROM SWAPS s
      JOIN USERS u1 ON s.requester_id = u1.user_id
      JOIN USERS u2 ON s.owner_id = u2.user_id
      WHERE 1=1
    `
    let countQuery = `
      SELECT COUNT(*) FROM SWAPS s
      JOIN USERS u1 ON s.requester_id = u1.user_id
      JOIN USERS u2 ON s.owner_id = u2.user_id
      WHERE 1=1
    `
    const queryParams = []
    let paramIndex = 1

    // Add search functionality
    if (search) {
      const searchCondition = ` AND (
        s.swap_id::text ILIKE $${paramIndex} OR 
        s.status ILIKE $${paramIndex} OR 
        s.swap_type ILIKE $${paramIndex} OR
        u1.first_name ILIKE $${paramIndex} OR
        u1.last_name ILIKE $${paramIndex} OR
        u2.first_name ILIKE $${paramIndex} OR
        u2.last_name ILIKE $${paramIndex}
      )`
      query += searchCondition
      countQuery += searchCondition
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    // Add sorting
    const validSortColumns = ['created_at', 'status', 'swap_type', 'points_used']
    if (validSortColumns.includes(sortBy)) {
      query += ` ORDER BY s.${sortBy} ${sortOrder.toUpperCase()}`
    }

    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    queryParams.push(limit, offset)

    const [ordersResult, countResult] = await Promise.all([
      req.pgClient.query(query, queryParams),
      req.pgClient.query(countQuery, search ? [`%${search}%`] : [])
    ])

    const orders = ordersResult.rows.map(order => ({
      id: order.swap_id,
      userName: order.requester_name,
      type: order.swap_type === 'item_swap' ? 'Swap' : 'Redemption',
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      date: order.created_at.toISOString().split('T')[0],
      value: order.swap_type === 'point_redemption' ? `${order.points_used} Points` : order.message || 'Item Swap'
    }))

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
        totalOrders: parseInt(countResult.rows[0].count),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Get all orders error:', error)
    res.status(500).json({ message: 'Failed to fetch orders' })
  }
}

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params
    const result = await req.pgClient.query(
      `SELECT s.*, 
              u1.first_name || ' ' || u1.last_name as requester_name,
              u2.first_name || ' ' || u2.last_name as owner_name,
              u1.email as requester_email,
              u2.email as owner_email
       FROM SWAPS s
       JOIN USERS u1 ON s.requester_id = u1.user_id
       JOIN USERS u2 ON s.owner_id = u2.user_id
       WHERE s.swap_id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const order = result.rows[0]
    res.json({
      id: order.swap_id,
      requesterName: order.requester_name,
      ownerName: order.owner_name,
      type: order.swap_type,
      status: order.status,
      pointsUsed: order.points_used,
      message: order.message,
      createdAt: order.created_at,
      completedAt: order.completed_at
    })
  } catch (error) {
    console.error('Get order by ID error:', error)
    res.status(500).json({ message: 'Failed to fetch order' })
  }
}

const completeOrder = async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await req.pgClient.query(
      'UPDATE SWAPS SET status = $1, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE swap_id = $2 RETURNING *',
      ['completed', id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' })
    }

    await logAdminAction(req.pgClient, req.user.userId, 'COMPLETE_ORDER', 'swap', id)

    res.json({ message: 'Order completed successfully' })
  } catch (error) {
    console.error('Complete order error:', error)
    res.status(500).json({ message: 'Failed to complete order' })
  }
}

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await req.pgClient.query(
      'UPDATE SWAPS SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE swap_id = $2 RETURNING *',
      ['cancelled', id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' })
    }

    await logAdminAction(req.pgClient, req.user.userId, 'CANCEL_ORDER', 'swap', id)

    res.json({ message: 'Order cancelled successfully' })
  } catch (error) {
    console.error('Cancel order error:', error)
    res.status(500).json({ message: 'Failed to cancel order' })
  }
}

// Listing/Item Management Controllers
const getAllListings = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query
    const skip = (page - 1) * limit

    // Build MongoDB aggregation pipeline
    const pipeline = []
    
    // Match stage for search
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { brand: { $regex: search, $options: 'i' } },
            { itemId: { $regex: search, $options: 'i' } }
          ]
        }
      })
    }

    // Add user information
    pipeline.push({
      $addFields: {
        userIdString: '$userId'
      }
    })

    // Sort stage
    const sortDirection = sortOrder.toLowerCase() === 'desc' ? -1 : 1
    const sortField = sortBy === 'date' ? 'createdAt' : sortBy
    pipeline.push({ $sort: { [sortField]: sortDirection } })

    // Get total count
    const countPipeline = [...pipeline, { $count: "total" }]
    const countResult = await req.mongoDb.collection('items').aggregate(countPipeline).toArray()
    const totalCount = countResult.length > 0 ? countResult[0].total : 0

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) })

    const items = await req.mongoDb.collection('items').aggregate(pipeline).toArray()

    // Get user information for each item
    const userIds = [...new Set(items.map(item => item.userId))]
    const users = await req.pgClient.query(
      'SELECT user_id, first_name, last_name FROM USERS WHERE user_id = ANY($1)',
      [userIds]
    )
    
    const userMap = {}
    users.rows.forEach(user => {
      userMap[user.user_id] = `${user.first_name || ''} ${user.last_name || ''}`.trim()
    })

    const listings = items.map(item => ({
      id: item.itemId,
      userName: userMap[item.userId] || 'Unknown User',
      item: item.title,
      status: item.status === 'approved' ? 'Available' : 
              item.status === 'pending' ? 'Pending Swap' : 'Removed',
      date: new Date(item.createdAt).toISOString().split('T')[0],
      description: item.description,
      imageUrl: item.primaryImage || '/placeholder.svg?height=150&width=150'
    }))

    res.json({
      listings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalListings: totalCount,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Get all listings error:', error)
    res.status(500).json({ message: 'Failed to fetch listings' })
  }
}

const getListingById = async (req, res) => {
  try {
    const { id } = req.params
    const item = await req.mongoDb.collection('items').findOne({ itemId: id })

    if (!item) {
      return res.status(404).json({ message: 'Listing not found' })
    }

    // Get user information
    const user = await req.pgClient.query(
      'SELECT first_name, last_name, email FROM USERS WHERE user_id = $1',
      [item.userId]
    )

    const userName = user.rows.length > 0 ? 
      `${user.rows[0].first_name || ''} ${user.rows[0].last_name || ''}`.trim() : 
      'Unknown User'

    res.json({
      id: item.itemId,
      userName,
      title: item.title,
      description: item.description,
      status: item.status,
      condition: item.condition,
      size: item.size,
      color: item.color,
      brand: item.brand,
      pointValue: item.pointValue,
      createdAt: item.createdAt,
      tags: item.tags || []
    })
  } catch (error) {
    console.error('Get listing by ID error:', error)
    res.status(500).json({ message: 'Failed to fetch listing' })
  }
}

const updateListing = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body, updatedAt: new Date() }

    const result = await req.mongoDb.collection('items').updateOne(
      { itemId: id },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Listing not found' })
    }

    await logAdminAction(req.pgClient, req.user.userId, 'UPDATE_LISTING', 'item', id, updateData)

    res.json({ message: 'Listing updated successfully' })
  } catch (error) {
    console.error('Update listing error:', error)
    res.status(500).json({ message: 'Failed to update listing' })
  }
}

const removeListing = async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await req.mongoDb.collection('items').updateOne(
      { itemId: id },
      { $set: { status: 'deleted', updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Listing not found' })
    }

    await logAdminAction(req.pgClient, req.user.userId, 'REMOVE_LISTING', 'item', id)

    res.json({ message: 'Listing removed successfully' })
  } catch (error) {
    console.error('Remove listing error:', error)
    res.status(500).json({ message: 'Failed to remove listing' })
  }
}

const approveListing = async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await req.mongoDb.collection('items').updateOne(
      { itemId: id },
      { 
        $set: { 
          status: 'approved', 
          isAvailable: true,
          approvedAt: new Date(),
          approvedBy: req.user.userId,
          updatedAt: new Date() 
        } 
      }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Listing not found' })
    }

    await logAdminAction(req.pgClient, req.user.userId, 'APPROVE_LISTING', 'item', id)

    res.json({ message: 'Listing approved successfully' })
  } catch (error) {
    console.error('Approve listing error:', error)
    res.status(500).json({ message: 'Failed to approve listing' })
  }
}

const rejectListing = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    
    const result = await req.mongoDb.collection('items').updateOne(
      { itemId: id },
      { 
        $set: { 
          status: 'rejected', 
          isAvailable: false,
          rejectionReason: reason,
          rejectedAt: new Date(),
          rejectedBy: req.user.userId,
          updatedAt: new Date() 
        } 
      }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Listing not found' })
    }

    await logAdminAction(req.pgClient, req.user.userId, 'REJECT_LISTING', 'item', id, { reason })

    res.json({ message: 'Listing rejected successfully' })
  } catch (error) {
    console.error('Reject listing error:', error)
    res.status(500).json({ message: 'Failed to reject listing' })
  }
}

// Analytics Controllers
const getDashboardAnalytics = async (req, res) => {
  try {
    const [userStats, orderStats, listingStats] = await Promise.all([
      req.pgClient.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE is_active = true) as active_users,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_30d
        FROM USERS
      `),
      req.pgClient.query(`
        SELECT 
          COUNT(*) as total_orders,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as orders_30d
        FROM SWAPS
      `),
      req.mongoDb.collection('items').aggregate([
        {
          $group: {
            _id: null,
            totalListings: { $sum: 1 },
            availableListings: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
            pendingListings: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } }
          }
        }
      ]).toArray()
    ])

    res.json({
      users: userStats.rows[0],
      orders: orderStats.rows[0],
      listings: listingStats[0] || { totalListings: 0, availableListings: 0, pendingListings: 0 }
    })
  } catch (error) {
    console.error('Get dashboard analytics error:', error)
    res.status(500).json({ message: 'Failed to fetch analytics' })
  }
}

const getAdminLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query
    const offset = (page - 1) * limit

    const result = await req.pgClient.query(`
      SELECT al.*, u.first_name || ' ' || u.last_name as admin_name
      FROM ADMIN_LOGS al
      JOIN USERS u ON al.admin_id = u.user_id
      ORDER BY al.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset])

    const countResult = await req.pgClient.query('SELECT COUNT(*) FROM ADMIN_LOGS')

    res.json({
      logs: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
        totalLogs: parseInt(countResult.rows[0].count),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Get admin logs error:', error)
    res.status(500).json({ message: 'Failed to fetch admin logs' })
  }
}

module.exports = {
  // User management
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  suspendUser,
  activateUser,
  
  // Order management
  getAllOrders,
  getOrderById,
  completeOrder,
  cancelOrder,
  
  // Listing management
  getAllListings,
  getListingById,
  updateListing,
  removeListing,
  approveListing,
  rejectListing,
  
  // Analytics
  getDashboardAnalytics,
  getAdminLogs
}
