import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Bell, 
  MessageCircle, 
  Users, 
  BookOpen, 
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Settings
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'mention' | 'reply' | 'announcement' | 'assignment' | 'system';
  title: string;
  content: string;
  course?: string;
  author: string;
  timestamp: string;
  isRead: boolean;
  isImportant?: boolean;
}

interface NotificationsPageProps {
  user: { name: string };
}

export function NotificationsPage({ user }: NotificationsPageProps) {
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'mention',
      title: 'You were mentioned in CS201',
      content: '@john mentioned you in "General Discussion": "Great question about binary trees!"',
      course: 'CS201',
      author: 'Alex Chen',
      timestamp: '2 hours ago',
      isRead: false
    },
    {
      id: '2',
      type: 'announcement',
      title: 'New Assignment Posted',
      content: 'Assignment 3: Graph Algorithms has been posted. Due date: October 15th',
      course: 'CS201',
      author: 'Dr. Sarah Wilson',
      timestamp: '4 hours ago',
      isRead: false,
      isImportant: true
    },
    {
      id: '3',
      type: 'reply',
      title: 'Reply to your message',
      content: 'Dr. Wilson replied to your question about Dijkstra\'s algorithm',
      course: 'CS301',
      author: 'Dr. Sarah Wilson',
      timestamp: '6 hours ago',
      isRead: true
    },
    {
      id: '4',
      type: 'system',
      title: 'Course enrollment confirmed',
      content: 'You have been successfully enrolled in Software Engineering (CS401)',
      author: 'System',
      timestamp: '1 day ago',
      isRead: true
    },
    {
      id: '5',
      type: 'assignment',
      title: 'Assignment reminder',
      content: 'Assignment 2 is due tomorrow at 11:59 PM',
      course: 'CS301',
      author: 'System',
      timestamp: '1 day ago',
      isRead: false,
      isImportant: true
    },
    {
      id: '6',
      type: 'announcement',
      title: 'Midterm exam schedule',
      content: 'Midterm examination will be held on October 20th, 2024 from 2:00-4:00 PM',
      course: 'CS201',
      author: 'Prof. Michael Chen',
      timestamp: '2 days ago',
      isRead: true,
      isImportant: true
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return <MessageCircle className="h-5 w-5 text-blue-600" />;
      case 'reply':
        return <MessageCircle className="h-5 w-5 text-green-600" />;
      case 'announcement':
        return <Bell className="h-5 w-5 text-purple-600" />;
      case 'assignment':
        return <BookOpen className="h-5 w-5 text-orange-600" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const importantCount = notifications.filter(n => n.isImportant && !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with your academic activities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Important</p>
                <p className="text-2xl font-bold">{importantCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  !notification.isRead ? 'bg-blue-50 dark:bg-blue-950 border-blue-200' : 'bg-white dark:bg-gray-900'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {notification.title}
                      </h3>
                      {notification.isImportant && (
                        <Badge variant="destructive" className="text-xs">
                          Important
                        </Badge>
                      )}
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {notification.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Avatar className="w-4 h-4">
                            <AvatarFallback className="text-xs">
                              {getInitials(notification.author)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{notification.author}</span>
                        </div>
                        {notification.course && (
                          <>
                            <span>•</span>
                            <span className="font-medium">{notification.course}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{notification.timestamp}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && (
                          <Button variant="ghost" size="sm" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Mark as read
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {notifications.length === 0 && (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                No notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="font-medium">Email Notifications</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">Course announcements</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">Assignment deadlines</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Forum mentions</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Push Notifications</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">Direct messages</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">Urgent announcements</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Forum replies</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Button>Save Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}