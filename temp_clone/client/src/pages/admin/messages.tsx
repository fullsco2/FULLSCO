import { useState } from 'react';
import { MessageSquare, Search, Trash2, Star, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/admin-layout';

// Mock data for messages (would normally be fetched from API)
const mockMessages = [
  {
    id: 1,
    name: 'محمد أحمد',
    email: 'mohamed@example.com',
    subject: 'استفسار حول منحة جامعة هارفارد',
    message: 'السلام عليكم، أرغب في الاستفسار عن متطلبات التقديم لمنحة جامعة هارفارد للعام القادم. هل يمكنكم توضيح الشروط والأوراق المطلوبة؟',
    date: '2025-04-25T10:30:00',
    isRead: true,
    isStarred: true,
    status: 'pending' // pending, responded, archived
  },
  {
    id: 2,
    name: 'فاطمة علي',
    email: 'fatima@example.com',
    subject: 'مشكلة في التسجيل على الموقع',
    message: 'مرحباً، أواجه مشكلة في إكمال التسجيل على الموقع. عند الضغط على زر التسجيل لا يحدث أي شيء. أرجو المساعدة في حل المشكلة.',
    date: '2025-04-24T14:15:00',
    isRead: false,
    isStarred: false,
    status: 'pending'
  },
  {
    id: 3,
    name: 'خالد محمود',
    email: 'khaled@example.com',
    subject: 'شكر وتقدير',
    message: 'أود أن أشكركم على المجهود الرائع في توفير المعلومات عن المنح الدراسية. لقد استفدت كثيراً من موقعكم في الحصول على منحة دراسية.',
    date: '2025-04-22T09:45:00',
    isRead: true,
    isStarred: false,
    status: 'responded'
  },
  {
    id: 4,
    name: 'سارة حسن',
    email: 'sara@example.com',
    subject: 'طلب تعاون',
    message: 'مرحباً، أمثل مؤسسة تعليمية تقدم منح دراسية للطلاب المتفوقين. نود التعاون معكم لنشر معلومات عن المنح التي نقدمها على موقعكم.',
    date: '2025-04-20T16:30:00',
    isRead: true,
    isStarred: true,
    status: 'archived'
  },
  {
    id: 5,
    name: 'أحمد ياسر',
    email: 'ahmed@example.com',
    subject: 'استفسار عن منح الدكتوراه',
    message: 'السلام عليكم، هل لديكم معلومات عن منح الدكتوراه في مجال الهندسة المدنية؟ أبحث عن منح في أوروبا وأمريكا.',
    date: '2025-04-18T11:20:00',
    isRead: false,
    isStarred: false,
    status: 'pending'
  }
];

const AdminMessages = () => {
  // State
  const [messages, setMessages] = useState(mockMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [filter, setFilter] = useState('all'); // all, unread, starred, pending, responded, archived

  // Filter messages
  const filteredMessages = messages.filter(message => {
    // Search filter
    const matchesSearch = 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    let matchesFilter = true;
    if (filter === 'unread') matchesFilter = !message.isRead;
    else if (filter === 'starred') matchesFilter = message.isStarred;
    else if (filter === 'pending' || filter === 'responded' || filter === 'archived') {
      matchesFilter = message.status === filter;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Handle message selection
  const handleSelectMessage = (message: any) => {
    setSelectedMessage(message);
    
    // Mark as read if it was unread
    if (!message.isRead) {
      setMessages(prev => 
        prev.map(m => 
          m.id === message.id ? { ...m, isRead: true } : m
        )
      );
    }
  };

  // Toggle star status
  const toggleStar = (id: number) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === id ? { ...message, isStarred: !message.isStarred } : message
      )
    );
  };

  // Delete message
  const deleteMessage = (id: number) => {
    setMessages(prev => prev.filter(message => message.id !== id));
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(null);
    }
  };

  // Update message status
  const updateStatus = (id: number, status: string) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === id ? { ...message, status } : message
      )
    );
    
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage({ ...selectedMessage, status });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout title="الرسائل" actions={null}>
      <div className="flex flex-col md:flex-row w-full">
        {/* Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-l bg-white">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="بحث في الرسائل..."
                className="w-full border rounded-md py-2 px-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setFilter('all')}
              >
                الكل ({messages.length})
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'unread' 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setFilter('unread')}
              >
                غير مقروءة ({messages.filter(m => !m.isRead).length})
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'starred' 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setFilter('starred')}
              >
                مميزة ({messages.filter(m => m.isStarred).length})
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'pending' 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setFilter('pending')}
              >
                بانتظار الرد ({messages.filter(m => m.status === 'pending').length})
              </button>
            </div>
          </div>
          
          {/* Messages List */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">لا توجد رسائل مطابقة للبحث</p>
              </div>
            ) : (
              filteredMessages.map(message => (
                <div 
                  key={message.id} 
                  className={`p-4 border-b cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id 
                      ? 'bg-blue-50' 
                      : message.isRead ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50`}
                  onClick={() => handleSelectMessage(message)}
                >
                  <div className="flex justify-between mb-1">
                    <h3 className={`font-medium ${!message.isRead ? 'font-bold' : ''}`}>
                      {message.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {!message.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                      <button 
                        className={`text-gray-400 hover:text-yellow-500 ${message.isStarred ? 'text-yellow-500' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(message.id);
                        }}
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm truncate">
                    {message.subject}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {message.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(message.date)}
                  </p>
                  <div className="mt-2">
                    {message.status === 'pending' && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        بانتظار الرد
                      </span>
                    )}
                    {message.status === 'responded' && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        تم الرد
                      </span>
                    )}
                    {message.status === 'archived' && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        في الأرشيف
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Message Content */}
        <div className="flex-1 bg-gray-50 p-6 hidden md:block">
          {selectedMessage ? (
            <>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{selectedMessage.subject}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-600">من: {selectedMessage.name}</p>
                      <span className="text-sm text-gray-400">({selectedMessage.email})</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(selectedMessage.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className={`p-2 rounded-full hover:bg-gray-100 ${selectedMessage.isStarred ? 'text-yellow-500' : 'text-gray-400'}`}
                      onClick={() => toggleStar(selectedMessage.id)}
                    >
                      <Star className="h-5 w-5" />
                    </button>
                    <button 
                      className="p-2 rounded-full hover:bg-gray-100 text-red-500"
                      onClick={() => deleteMessage(selectedMessage.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="border-t pt-4 my-4">
                  <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>
                
                <div className="border-t pt-4 flex flex-wrap gap-2">
                  <button 
                    className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${
                      selectedMessage.status === 'responded' ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'
                    }`}
                    onClick={() => updateStatus(selectedMessage.id, 'responded')}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {selectedMessage.status === 'responded' ? 'تم الرد' : 'تعيين كـ "تم الرد"'}
                  </button>
                  
                  <button 
                    className="px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-2"
                    onClick={() => updateStatus(selectedMessage.id, 'archived')}
                  >
                    <XCircle className="h-4 w-4" />
                    أرشفة
                  </button>
                  
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=رد: ${selectedMessage.subject}`}
                    className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    الرد عبر البريد
                  </a>
                </div>
              </div>
              
              {/* Reply Form placeholder */}
              <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
                <h3 className="font-medium mb-3">الرد على الرسالة</h3>
                <textarea
                  className="w-full border rounded-md p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أكتب ردك هنا..."
                ></textarea>
                <div className="mt-3 flex justify-end">
                  <button className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">
                    إرسال الرد
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-xl font-medium text-gray-600 mb-2">
                لم يتم تحديد أي رسالة
              </h2>
              <p className="text-gray-500">
                يرجى اختيار رسالة من القائمة لعرض محتواها
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;