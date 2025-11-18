import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Plus,
  Settings,
  Search,
  Edit,
  Trash2,
  UserPlus,
  MessageCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

interface Course {
  id: string;
  name: string;
  code: string;
  lecturer: string;
  students: number;
  forums: number;
  lastActivity: string;
  status: 'active' | 'archived';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Lecturer' | 'Admin';
  department: string;
  joinDate: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

interface AdminPanelProps {
  user: { role: string };
}

export function AdminPanel({ user }: AdminPanelProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  const courses: Course[] = [
    {
      id: '1',
      name: 'Data Structures & Algorithms',
      code: 'CS201',
      lecturer: 'Dr. Sarah Wilson',
      students: 45,
      forums: 5,
      lastActivity: '2 hours ago',
      status: 'active'
    },
    {
      id: '2',
      name: 'Database Systems',
      code: 'CS301',
      lecturer: 'Prof. Michael Chen',
      students: 38,
      forums: 4,
      lastActivity: '5 hours ago',
      status: 'active'
    },
    {
      id: '3',
      name: 'Operating Systems',
      code: 'CS350',
      lecturer: 'Dr. Emily Rodriguez',
      students: 0,
      forums: 0,
      lastActivity: 'Never',
      status: 'archived'
    }
  ];

  const users: User[] = [
    {
      id: '1',
      name: 'Dr. Sarah Wilson',
      email: 'sarah.wilson@university.edu',
      role: 'Lecturer',
      department: 'Computer Science',
      joinDate: 'Jan 2023',
      lastActive: '2 hours ago',
      status: 'active'
    },
    {
      id: '2',
      name: 'Alex Chen',
      email: 'alex.chen@student.university.edu',
      role: 'Student',
      department: 'Computer Science',
      joinDate: 'Sep 2023',
      lastActive: '1 hour ago',
      status: 'active'
    },
    {
      id: '3',
      name: 'Maria Garcia',
      email: 'maria.garcia@student.university.edu',
      role: 'Student',
      department: 'Computer Engineering',
      joinDate: 'Sep 2023',
      lastActive: '3 days ago',
      status: 'inactive'
    }
  ];

  const stats = {
    totalUsers: 156,
    activeCourses: 12,
    totalMessages: 2847,
    activeUsers: 89
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Lecturer': return 'bg-purple-100 text-purple-800';
      case 'Admin': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage courses, users, and system settings
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowCreateCourse(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Course
          </Button>
          <Button variant="outline" onClick={() => setShowAddUser(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Courses</p>
                    <p className="text-2xl font-bold">{stats.activeCourses}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageCircle className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Messages</p>
                    <p className="text-2xl font-bold">{stats.totalMessages.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold">{stats.activeUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.slice(0, 3).map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{course.name}</h3>
                        <p className="text-sm text-gray-600">{course.code} • {course.students} students</p>
                      </div>
                      <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                        {course.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.slice(0, 3).map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar>
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.department}</p>
                      </div>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input placeholder="Search courses..." className="w-64" />
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{course.name}</h3>
                        <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                          {course.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{course.code} • Instructor: {course.lecturer}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{course.students} students</span>
                        <span>{course.forums} forums</span>
                        <span>Last active: {course.lastActivity}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input placeholder="Search users..." className="w-64" />
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium">{user.name}</h3>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>{user.department}</span>
                          <span>Joined: {user.joinDate}</span>
                          <span>Last active: {user.lastActive}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  User Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Daily Active Users</span>
                    <span className="font-bold">89</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Weekly Active Users</span>
                    <span className="font-bold">134</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monthly Active Users</span>
                    <span className="font-bold">156</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Forum Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Messages Today</span>
                    <span className="font-bold">47</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Forums</span>
                    <span className="font-bold">23</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Response Time</span>
                    <span className="font-bold">2.3h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-green-600">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-blue-600">1.2s</div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-purple-600">45GB</div>
                  <div className="text-sm text-gray-600">Storage Used</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Course Modal */}
      {showCreateCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="course-name">Course Name</Label>
                <Input id="course-name" placeholder="e.g. Data Structures & Algorithms" />
              </div>
              <div>
                <Label htmlFor="course-code">Course Code</Label>
                <Input id="course-code" placeholder="e.g. CS201" />
              </div>
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input id="instructor" placeholder="e.g. Dr. John Smith" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Course description..." />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateCourse(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateCourse(false)}>
                  Create Course
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}