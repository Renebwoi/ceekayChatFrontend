import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Home, 
  BookOpen, 
  MessageCircle, 
  Bell, 
  User, 
  Settings,
  LogOut,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  user: { name: string; role: string; department: string };
  onNavigate: (page: string) => void;
  onLogout: () => void;
  notificationCount?: number;
}

export function Sidebar({ currentPage, user, onNavigate, onLogout, notificationCount = 0 }: SidebarProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const navigationItems = [
    { key: 'dashboard', label: 'Home', icon: Home },
    { key: 'courses', label: 'Courses', icon: BookOpen },
    { key: 'forums', label: 'Forums', icon: MessageCircle },
    { 
      key: 'notifications', 
      label: 'Notifications', 
      icon: Bell,
      badge: notificationCount > 0 ? notificationCount : undefined
    },
    { key: 'profile', label: 'Profile', icon: User },
  ];

  // Add admin panel for lecturers and admins
  if (user.role === 'Lecturer' || user.role === 'Admin') {
    navigationItems.push({ key: 'admin', label: 'Admin Panel', icon: Settings });
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">AcademicChat</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">University Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.key;
          
          return (
            <Button
              key={item.key}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${isActive ? 'bg-blue-600 text-white' : ''}`}
              onClick={() => onNavigate(item.key)}
            >
              <IconComponent className="h-4 w-4 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar>
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user.name}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user.role}</p>
            <p className="text-xs text-gray-500 truncate">{user.department}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}