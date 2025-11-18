import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BookOpen, MessageCircle, Clock, Users } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  code: string;
  lecturer: string;
  students: number;
  lastActivity: string;
  unreadMessages: number;
}

interface RecentActivity {
  id: string;
  type: 'message' | 'announcement' | 'assignment';
  course: string;
  content: string;
  time: string;
  author: string;
}

interface DashboardProps {
  user: { name: string; role: string; department: string };
  onNavigate: (page: string, courseId?: string) => void;
}

export function Dashboard({ user, onNavigate }: DashboardProps) {
  const courses: Course[] = [
    {
      id: '1',
      name: 'Data Structures & Algorithms',
      code: 'CS201',
      lecturer: 'Dr. Sarah Wilson',
      students: 45,
      lastActivity: '2 hours ago',
      unreadMessages: 3
    },
    {
      id: '2',
      name: 'Database Systems',
      code: 'CS301',
      lecturer: 'Prof. Michael Chen',
      students: 38,
      lastActivity: '5 hours ago',
      unreadMessages: 0
    },
    {
      id: '3',
      name: 'Software Engineering',
      code: 'CS401',
      lecturer: 'Dr. Emily Rodriguez',
      students: 52,
      lastActivity: '1 day ago',
      unreadMessages: 7
    }
  ];

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'message',
      course: 'CS201',
      content: 'New solution posted for Assignment 3',
      time: '2 hours ago',
      author: 'Dr. Sarah Wilson'
    },
    {
      id: '2',
      type: 'announcement',
      course: 'CS301',
      content: 'Midterm exam scheduled for next week',
      time: '5 hours ago',
      author: 'Prof. Michael Chen'
    },
    {
      id: '3',
      type: 'message',
      course: 'CS401',
      content: 'Group project presentations next Friday',
      time: '1 day ago',
      author: 'Dr. Emily Rodriguez'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-600" />;
      case 'announcement':
        return <BookOpen className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
        <p className="text-blue-100 mt-1">{user.role} • {user.department}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold">
                  {courses.reduce((total, course) => total + course.unreadMessages, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">
                  {courses.reduce((total, course) => total + course.students, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
            <CardDescription>Click on a course to view forums and discussions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => onNavigate('course', course.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{course.name}</h3>
                        {course.unreadMessages > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {course.unreadMessages}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{course.code} • {course.lecturer}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Users className="h-3 w-3 mr-1" />
                        {course.students} students • Last activity {course.lastActivity}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.content}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <span className="font-medium">{activity.course}</span>
                      <span className="mx-2">•</span>
                      <span>{activity.author}</span>
                      <span className="mx-2">•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}