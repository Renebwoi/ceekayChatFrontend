import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MessageCircle, Users, Clock, FileText, Settings, Plus } from 'lucide-react';

interface Forum {
  id: string;
  title: string;
  description: string;
  messageCount: number;
  unreadCount: number;
  lastActivity: string;
  lastMessage: {
    author: string;
    content: string;
  };
  participants: number;
}

interface CoursePageProps {
  courseId: string;
  user: { role: string };
  onNavigate: (page: string, forumId?: string) => void;
}

export function CoursePage({ courseId, user, onNavigate }: CoursePageProps) {
  const course = {
    id: courseId,
    name: 'Data Structures & Algorithms',
    code: 'CS201',
    lecturer: 'Dr. Sarah Wilson',
    students: 45,
    description: 'Learn fundamental data structures and algorithms with practical implementations.'
  };

  const forums: Forum[] = [
    {
      id: '1',
      title: 'General Discussion',
      description: 'General course discussions and announcements',
      messageCount: 124,
      unreadCount: 3,
      lastActivity: '2 hours ago',
      lastMessage: {
        author: 'Dr. Sarah Wilson',
        content: 'Remember to submit your assignments by Friday...'
      },
      participants: 42
    },
    {
      id: '2',
      title: 'Assignments & Projects',
      description: 'Questions and discussions about assignments',
      messageCount: 89,
      unreadCount: 0,
      lastActivity: '5 hours ago',
      lastMessage: {
        author: 'Alex Chen',
        content: 'Has anyone finished the binary tree implementation?'
      },
      participants: 35
    },
    {
      id: '3',
      title: 'Study Group',
      description: 'Collaborative learning and peer support',
      messageCount: 67,
      unreadCount: 7,
      lastActivity: '1 hour ago',
      lastMessage: {
        author: 'Maria Garcia',
        content: 'Study session tomorrow at 3 PM in the library'
      },
      participants: 28
    },
    {
      id: '4',
      title: 'Resources & Links',
      description: 'Useful resources, papers, and external links',
      messageCount: 34,
      unreadCount: 0,
      lastActivity: '1 day ago',
      lastMessage: {
        author: 'Dr. Sarah Wilson',
        content: 'Added new visualization tool for graph algorithms'
      },
      participants: 45
    },
    {
      id: '5',
      title: 'Q&A with Lecturer',
      description: 'Direct questions and answers with course instructor',
      messageCount: 156,
      unreadCount: 2,
      lastActivity: '3 hours ago',
      lastMessage: {
        author: 'John Smith',
        content: 'Question about time complexity of merge sort...'
      },
      participants: 41
    }
  ];

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{course.name}</h1>
            <p className="text-blue-100 mt-1">{course.code} • {course.lecturer}</p>
            <p className="text-blue-200 text-sm mt-2">{course.description}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-blue-100">
              <Users className="h-4 w-4 mr-1" />
              {course.students} students
            </div>
            {user.role === 'Lecturer' || user.role === 'Admin' ? (
              <Button variant="secondary" size="sm" className="mt-2">
                <Settings className="h-4 w-4 mr-2" />
                Manage Course
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Forums List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Discussion Forums</h2>
          {user.role === 'Lecturer' || user.role === 'Admin' ? (
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Forum
            </Button>
          ) : null}
        </div>

        <div className="grid gap-4">
          {forums.map((forum) => (
            <Card 
              key={forum.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onNavigate('forum', forum.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">{forum.title}</h3>
                      {forum.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {forum.unreadCount} new
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {forum.description}
                    </p>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{forum.lastMessage.author}:</span>{' '}
                        {forum.lastMessage.content}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {forum.messageCount} messages
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {forum.participants} participants
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {forum.lastActivity}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Course Materials</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Class Members</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Clock className="h-6 w-6" />
              <span className="text-sm">Schedule</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Settings className="h-6 w-6" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}