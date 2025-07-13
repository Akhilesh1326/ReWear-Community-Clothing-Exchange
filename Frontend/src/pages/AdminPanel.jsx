import React, { useState, useEffect } from 'react';
import { User, ShoppingBag, Shirt, Search, XCircle, CheckCircle, Edit, Trash2, Eye, PlusCircle, Recycle, ArrowUp, ArrowDown } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'orders', 'listings'
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [notification, setNotification] = useState(null); // { message: '', type: 'success' | 'error' }
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Sample Data (replace with actual data from a backend)
  const [users, setUsers] = useState([
    { id: 'user_001', name: 'Akhilesh Pimple', email: 'akhilesh.p@example.com', status: 'Active', joined: '2023-01-15', points: 120 },
    { id: 'user_002', name: 'Ashwanti Gaikwad', email: 'ashwanti.g@example.com', status: 'Inactive', joined: '2023-02-20', points: 50 },
    { id: 'user_003', name: 'Om Shete', email: 'om.s@example.com', status: 'Active', joined: '2023-03-10', points: 200 },
    { id: 'user_004', name: 'Rishabh Kadadore', email: 'rishabh.k@example.com', status: 'Active', joined: '2023-04-01', points: 80 },
    { id: 'user_005', name: 'Shravani Jadhav', email: 'shravani.j@example.com', status: 'Suspended', joined: '2023-05-05', points: 0 },
  ]);

  const [orders, setOrders] = useState([
    { id: 'order_001', userId: 'user_001', userName: 'Akhilesh Pimple', type: 'Swap', status: 'Completed', date: '2024-06-20', value: 'Shirt for Jeans' },
    { id: 'order_002', userId: 'user_003', userName: 'Om Shete', type: 'Redemption', status: 'Pending', date: '2024-06-22', value: '150 Points' },
    { id: 'order_003', userId: 'user_002', userName: 'Ashwanti Gaikwad', type: 'Swap', status: 'Cancelled', date: '2024-06-18', value: 'Dress for Skirt' },
    { id: 'order_004', userId: 'user_004', userName: 'Rishabh Kadadore', type: 'Redemption', status: 'Completed', date: '2024-06-25', value: '80 Points' },
  ]);

  const [listings, setListings] = useState([
    { id: 'listing_001', userId: 'user_001', userName: 'Akhilesh Pimple', item: 'Blue Denim Jacket', status: 'Available', date: '2024-06-10', description: 'A stylish blue denim jacket, size M, good condition.', imageUrl: 'https://placehold.co/150x150/E0F2F1/004D40?text=Jacket' },
    { id: 'listing_002', userId: 'user_003', userName: 'Om Shete', item: 'Vintage Silk Scarf', status: 'Pending Swap', date: '2024-06-12', description: 'Hand-dyed vintage silk scarf with floral patterns.', imageUrl: 'https://placehold.co/150x150/E0F2F1/004D40?text=Scarf' },
    { id: 'listing_003', userId: 'user_005', userName: 'Shravani Jadhav', item: 'Black Leather Boots', status: 'Removed', date: '2024-06-05', description: 'Comfortable black leather boots, size 7, worn once.', imageUrl: 'https://placehold.co/150x150/E0F2F1/004D40?text=Boots' },
    { id: 'listing_004', userId: 'user_004', userName: 'Rishabh Kadadore', item: 'Striped T-Shirt', status: 'Available', date: '2024-06-15', description: 'Soft cotton striped t-shirt, size S, like new.', imageUrl: 'https://placehold.co/150x150/E0F2F1/004D40?text=T-Shirt' },
  ]);

  // Notification handling
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000); // Notification disappears after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  // Sorting logic
  const sortData = (data, config) => {
    if (!config.key) return data;

    return [...data].sort((a, b) => {
      if (a[config.key] < b[config.key]) {
        return config.direction === 'ascending' ? -1 : 1;
      }
      if (a[config.key] > b[config.key]) {
        return config.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  // Filtering logic
  const filteredUsers = sortData(users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.status.toLowerCase().includes(searchTerm.toLowerCase())
  ), sortConfig);

  const filteredOrders = sortData(orders.filter(order =>
    order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.type.toLowerCase().includes(searchTerm.toLowerCase())
  ), sortConfig);

  const filteredListings = sortData(listings.filter(listing =>
    listing.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.status.toLowerCase().includes(searchTerm.toLowerCase())
  ), sortConfig);

  const openModal = (content) => {
    setModalContent(content);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent({});
  };

  const handleAction = (type, id, action, newData = {}) => {
    // In a real application, this would involve API calls to update the backend
    console.log(`Performing ${action} on ${type} with ID: ${id}`, newData);

    let successMessage = '';
    let errorMessage = '';

    if (type === 'user') {
      if (action === 'update') {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...newData } : u));
        successMessage = 'User updated successfully!';
      } else if (action === 'add') {
        const newId = `user_${String(users.length + 1).padStart(3, '0')}`;
        setUsers(prev => [...prev, { id: newId, ...newData, joined: new Date().toISOString().split('T')[0] }]);
        successMessage = 'User added successfully!';
      } else if (action === 'delete') {
        setUsers(prev => prev.filter(u => u.id !== id));
        successMessage = 'User deleted successfully!';
      } else if (action === 'suspend') {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'Suspended' } : u));
        successMessage = 'User suspended successfully!';
      } else if (action === 'activate') {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'Active' } : u));
        successMessage = 'User activated successfully!';
      }
    } else if (type === 'order') {
      if (action === 'update') {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, ...newData } : o));
        successMessage = 'Order updated successfully!';
      } else if (action === 'add') {
        const newId = `order_${String(orders.length + 1).padStart(3, '0')}`;
        setOrders(prev => [...prev, { id: newId, ...newData, date: new Date().toISOString().split('T')[0] }]);
        successMessage = 'Order added successfully!';
      } else if (action === 'complete') {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Completed' } : o));
        successMessage = 'Order marked as completed!';
      } else if (action === 'cancel') {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Cancelled' } : o));
        successMessage = 'Order cancelled successfully!';
      }
    } else if (type === 'listing') {
      if (action === 'update') {
        setListings(prev => prev.map(l => l.id === id ? { ...l, ...newData } : l));
        successMessage = 'Listing updated successfully!';
      } else if (action === 'add') {
        const newId = `listing_${String(listings.length + 1).padStart(3, '0')}`;
        setListings(prev => [...prev, { id: newId, ...newData, date: new Date().toISOString().split('T')[0] }]);
        successMessage = 'Listing added successfully!';
      } else if (action === 'remove') {
        setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'Removed' } : l));
        successMessage = 'Listing removed successfully!';
      }
    }

    if (successMessage) {
      showNotification(successMessage, 'success');
    } else {
      errorMessage = 'Action failed.';
      showNotification(errorMessage, 'error');
    }
    closeModal();
  };

  const renderTable = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-sm overflow-hidden">
              <thead className="bg-emerald-100">
                <tr>
                  {['id', 'name', 'email', 'status', 'joined', 'points'].map(key => (
                    <th key={key} className="py-3 px-4 text-left text-xs sm:text-sm font-semibold text-emerald-700 uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-emerald-200" onClick={() => requestSort(key)}>
                      <div className="flex items-center">
                        {key.replace(/([A-Z])/g, ' $1').trim()} {getSortIcon(key)}
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center text-xs sm:text-sm font-semibold text-emerald-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-emerald-50 transition-colors duration-150">
                      <td className="py-3 px-4 text-xs sm:text-sm text-gray-700">{user.id}</td>
                      <td className="py-3 px-4 text-xs sm:text-sm text-gray-700">{user.name}</td>
                      <td className="py-3 px-4 text-xs sm:text-sm text-gray-700">{user.email}</td>
                      <td className="py-3 px-4 text-xs sm:text-sm">
                        <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold ${
                          user.status === 'Active' ? 'bg-green-100 text-green-800' :
                          user.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs sm:text-sm text-gray-700">{user.joined}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{user.points}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => openModal({ type: 'user', data: user, action: 'view' })}
                            className="p-1 sm:p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200 hover:shadow-md"
                            title="View Details"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => openModal({ type: 'user', data: user, action: 'edit' })}
                            className="p-1 sm:p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-all duration-200 hover:shadow-md"
                            title="Edit User"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          {user.status === 'Active' && (
                            <button
                              onClick={() => openModal({ type: 'user', data: user, action: 'suspend' })}
                              className="p-1 sm:p-2 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-all duration-200 hover:shadow-md"
                              title="Suspend User"
                            >
                              <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          )}
                          {user.status === 'Suspended' && (
                            <button
                              onClick={() => openModal({ type: 'user', data: user, action: 'activate' })}
                              className="p-1 sm:p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-all duration-200 hover:shadow-md"
                              title="Activate User"
                            >
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openModal({ type: 'user', data: user, action: 'delete' })}
                            className="p-1 sm:p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 hover:shadow-md"
                            title="Delete User"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-4 text-center text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case 'orders':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-sm overflow-hidden">
              <thead className="bg-emerald-100">
                <tr>
                  {['id', 'userName', 'type', 'status', 'date', 'value'].map(key => (
                    <th key={key} className="py-3 px-4 text-left text-xs sm:text-sm font-semibold text-emerald-700 uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-emerald-200" onClick={() => requestSort(key)}>
                      <div className="flex items-center">
                        {key.replace(/([A-Z])/g, ' $1').trim()} {getSortIcon(key)}
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center text-xs sm:text-sm font-semibold text-emerald-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-emerald-50 transition-colors duration-150">
                      <td className="py-3 px-4 text-xs sm:text-sm text-gray-700">{order.id}</td>
                      <td className="py-3 px-4 text-xs sm:text-sm text-gray-700">{order.userName}</td>
                      <td className="py-3 px-4 text-xs sm:text-sm text-gray-700">{order.type}</td>
                      <td className="py-3 px-4 text-xs sm:text-sm">
                        <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold ${
                          order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs sm:text-sm text-gray-700">{order.date}</td>
                      <td className="py-3 px-4 text-xs sm:text-sm text-gray-700">{order.value}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => openModal({ type: 'order', data: order, action: 'view' })}
                            className="p-1 sm:p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200 hover:shadow-md"
                            title="View Details"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          {order.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => openModal({ type: 'order', data: order, action: 'complete' })}
                                className="p-1 sm:p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-all duration-200 hover:shadow-md"
                                title="Mark Complete"
                              >
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={() => openModal({ type: 'order', data: order, action: 'cancel' })}
                                className="p-1 sm:p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 hover:shadow-md"
                                title="Cancel Order"
                              >
                                <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-4 text-center text-gray-500">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case 'listings':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-sm overflow-hidden">
              <thead className="bg-emerald-100">
                <tr>
                  {['id', 'userName', 'item', 'status', 'date'].map(key => (
                    <th key={key} className="py-3 px-4 text-left text-xs sm:text-sm font-semibold text-emerald-700 uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-emerald-200" onClick={() => requestSort(key)}>
                      <div className="flex items-center">
                        {key.replace(/([A-Z])/g, ' $1').trim()} {getSortIcon(key)}
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center text-xs sm:text-sm font-semibold text-emerald-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredListings.length > 0 ? (
                  filteredListings.map(listing => (
                    <tr key={listing.id} className="hover:bg-emerald-50 transition-colors duration-150">
                      <td className="py-3 px-4 text-xs sm:text-sm text-gray-700">{listing.id}</td>
                      <td className="py-3 px-4 text-xs sm:text-sm text-gray-700">{listing.userName}</td>
                      <td className="py-3 px-4 text-xs sm:text-sm text-gray-700">{listing.item}</td>
                      <td className="py-3 px-4 text-xs sm:text-sm">
                        <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold ${
                          listing.status === 'Available' ? 'bg-green-100 text-green-800' :
                          listing.status === 'Pending Swap' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs sm:text-sm text-gray-700">{listing.date}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => openModal({ type: 'listing', data: listing, action: 'view' })}
                            className="p-1 sm:p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200 hover:shadow-md"
                            title="View Details"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => openModal({ type: 'listing', data: listing, action: 'edit' })}
                            className="p-1 sm:p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-all duration-200 hover:shadow-md"
                            title="Edit Listing"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          {listing.status !== 'Removed' && (
                            <button
                              onClick={() => openModal({ type: 'listing', data: listing, action: 'remove' })}
                              className="p-1 sm:p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 hover:shadow-md"
                              title="Remove Listing"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-500">No listings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  const ModalForm = ({ type, data, action, onClose }) => {
    const [formData, setFormData] = useState(data || {});

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (action === 'add') {
        handleAction(type, null, action, formData);
      } else {
        handleAction(type, data.id, 'update', formData);
      }
    };

    const renderFields = () => {
      switch (type) {
        case 'user':
          return (
            <>
              <InputField label="Name" name="name" value={formData.name || ''} onChange={handleChange} required />
              <InputField label="Email" name="email" type="email" value={formData.email || ''} onChange={handleChange} required />
              <SelectField label="Status" name="status" value={formData.status || 'Active'} onChange={handleChange} options={['Active', 'Inactive', 'Suspended']} />
              <InputField label="Points" name="points" type="number" value={formData.points || 0} onChange={handleChange} required />
            </>
          );
        case 'order':
          return (
            <>
              <InputField label="User Name" name="userName" value={formData.userName || ''} onChange={handleChange} required />
              <SelectField label="Type" name="type" value={formData.type || 'Swap'} onChange={handleChange} options={['Swap', 'Redemption']} />
              <SelectField label="Status" name="status" value={formData.status || 'Pending'} onChange={handleChange} options={['Pending', 'Completed', 'Cancelled']} />
              <InputField label="Value" name="value" value={formData.value || ''} onChange={handleChange} required />
            </>
          );
        case 'listing':
          return (
            <>
              <InputField label="User Name" name="userName" value={formData.userName || ''} onChange={handleChange} required />
              <InputField label="Item Name" name="item" value={formData.item || ''} onChange={handleChange} required />
              <SelectField label="Status" name="status" value={formData.status || 'Available'} onChange={handleChange} options={['Available', 'Pending Swap', 'Removed']} />
              <TextAreaField label="Description" name="description" value={formData.description || ''} onChange={handleChange} />
              <InputField label="Image URL" name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} />
            </>
          );
        default:
          return null;
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderFields()}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
        >
          {action === 'add' ? 'Add New' : 'Save Changes'}
        </button>
      </form>
    );
  };

  const InputField = ({ label, name, type = 'text', value, onChange, required = false }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 capitalize mb-1">
        {label}:
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 shadow-sm text-sm sm:text-base"
      />
    </div>
  );

  const TextAreaField = ({ label, name, value, onChange }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 capitalize mb-1">
        {label}:
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows="3"
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 shadow-sm text-sm sm:text-base"
      ></textarea>
    </div>
  );

  const SelectField = ({ label, name, value, onChange, options }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 capitalize mb-1">
        {label}:
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 shadow-sm bg-white text-sm sm:text-base"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 font-sans text-gray-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-teal-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 p-4 rounded-xl shadow-xl text-white z-50 transition-all duration-300 transform translate-x-0 opacity-100 ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="relative z-10 flex flex-col md:flex-row"> {/* Changed to flex-col on mobile, flex-row on md and up */}
        {/* Sidebar / Navigation */}
        <aside className="w-full md:w-64 bg-emerald-700 text-white p-4 md:p-6 flex flex-col rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none shadow-2xl">
          <div className="flex items-center justify-center md:justify-start mb-6 mt-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-md transform rotate-6">
              <Recycle className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">ReWear Admin</h2>
          </div>
          <nav className="flex-grow">
            <ul className="flex flex-col sm:flex-row md:flex-col justify-center sm:justify-around md:justify-start flex-wrap gap-2 sm:gap-3 md:gap-0"> {/* Added flex-row, justify-around, flex-wrap, and gap for horizontal tabs */}
              <li className="w-full sm:w-auto md:w-full mb-2">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center w-full p-2 sm:p-3 rounded-xl text-left text-sm sm:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    activeTab === 'users' ? 'bg-emerald-600 shadow-md text-white' : 'hover:bg-emerald-600/70 text-emerald-100'
                  }`}
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  Manage Users
                </button>
              </li>
              <li className="w-full sm:w-auto md:w-full mb-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center w-full p-2 sm:p-3 rounded-xl text-left text-sm sm:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    activeTab === 'orders' ? 'bg-emerald-600 shadow-md text-white' : 'hover:bg-emerald-600/70 text-emerald-100'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  Manage Orders
                </button>
              </li>
              <li className="w-full sm:w-auto md:w-full mb-2">
                <button
                  onClick={() => setActiveTab('listings')}
                  className={`flex items-center w-full p-2 sm:p-3 rounded-xl text-left text-sm sm:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    activeTab === 'listings' ? 'bg-emerald-600 shadow-md text-white' : 'hover:bg-emerald-600/70 text-emerald-100'
                  }`}
                >
                  <Shirt className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  Manage Listings
                </button>
              </li>
            </ul>
          </nav>
          <div className="mt-auto pt-4 md:pt-6 border-t border-emerald-600">
            <button
              onClick={() => openModal({ type: activeTab.slice(0, -1), action: 'add' })}
              className="flex items-center w-full p-2 sm:p-3 rounded-xl text-left text-sm sm:text-base text-emerald-100 hover:bg-emerald-600/70 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              Add New {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-emerald-200"> {/* Simplified border */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-800 capitalize mb-4 sm:mb-0"> {/* Slightly reduced text size */}
              {`Manage ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
            </h1>
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 shadow-sm placeholder-gray-500 w-full" /* Simplified search input styling */
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /> {/* Adjusted icon size */}
            </div>
          </header>

          {/* Data Table Content */}
          <section className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 border border-emerald-100">
            {renderTable()}
          </section>
        </main>
      </div>

      {/* Modal for Details/Actions */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-3xl border border-white/30 p-6 sm:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg transform transition-all duration-300 scale-100 opacity-100 animate-slide-up">
            <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-emerald-200">
              <h3 className="text-xl sm:text-2xl font-bold text-emerald-700 capitalize">
                {modalContent.action === 'view' ? 'Details' : modalContent.action === 'edit' ? 'Edit' : modalContent.action === 'add' ? 'Add New' : 'Confirm'} {modalContent.type}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 sm:p-2 rounded-full hover:bg-gray-100"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {modalContent.action === 'view' && (
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(modalContent.data).map(([key, value]) => (
                  <p key={key} className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    <span className="font-semibold capitalize mr-2 text-emerald-700">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    {key === 'imageUrl' ? <img src={value} alt="Item" className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg mt-2 shadow-md" onError={(e) => e.target.src = 'https://placehold.co/150x150/E0F2F1/004D40?text=No+Image'} /> : value}
                  </p>
                ))}
              </div>
            )}

            {(modalContent.action === 'edit' || modalContent.action === 'add') && (
              <ModalForm
                type={modalContent.type}
                data={modalContent.data}
                action={modalContent.action}
                onClose={closeModal}
              />
            )}

            {(modalContent.action === 'delete' || modalContent.action === 'complete' || modalContent.action === 'cancel' || modalContent.action === 'remove' || modalContent.action === 'suspend' || modalContent.action === 'activate') && (
              <div className="text-center">
                <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 font-medium">
                  Are you sure you want to <span className="font-bold text-emerald-700">{modalContent.action}</span> this {modalContent.type} (ID: <span className="font-bold">{modalContent.data.id}</span>)?
                </p>
                <div className="flex justify-center space-x-3 sm:space-x-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 sm:px-6 sm:py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 font-semibold shadow-sm hover:shadow-md transform hover:scale-105 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAction(modalContent.type, modalContent.data.id, modalContent.action)}
                    className={`px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base ${
                      modalContent.action === 'delete' || modalContent.action === 'cancel' || modalContent.action === 'remove' || modalContent.action === 'suspend' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    Confirm {modalContent.action.charAt(0).toUpperCase() + modalContent.action.slice(1)}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
