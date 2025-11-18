import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Camera,
  Bell,
  Shield,
  Moon,
  Sun,
  Eye,
  BookOpen,
  Award,
  Settings
} from 'lucide-react';

interface ProfilePageProps {
  user: {
    name: string;
    email: string;
    role: string;
    department: string;
  };
}

export function ProfilePage({ user }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Computer Science student passionate about algorithms and data structures. Always eager to learn new technologies and collaborate on interesting projects.',
    website: 'https://johndoe.dev',
    joinDate: 'September 2023'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true,
    forumMentions: true,
    assignmentReminders: true,
    systemUpdates: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true
  });

  const enrolledCourses = [
    { id: '1', name: 'Data Structures & Algorithms', code: 'CS201', grade: 'A-' },
    { id: '2', name: 'Database Systems', code: 'CS301', grade: 'B+' },
    { id: '3', name: 'Software Engineering', code: 'CS401', grade: 'A' }
  ];

  const achievements = [
    { id: '1', title: 'Active Participant', description: '100+ forum posts', icon: '🎯' },
    { id: '2', title: 'Helpful Student', description: '50+ helpful answers', icon: '🤝' },
    { id: '3', title: 'Early Bird', description: 'Joined platform in first month', icon: '🐦' }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSave = () => {
    // In a real app, this would update the user profile
    setIsEditing(false);
    console.log('Saving profile:', profileData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile & Settings</h1>
        <Button 
          variant={isEditing ? "default" : "outline"}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="text-2xl">{getInitials(profileData.name)}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h2 className="text-2xl font-bold">{profileData.name}</h2>
                    <Badge variant="secondary">{user.role}</Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">{user.department}</p>
                  <p className="text-sm text-gray-500">Member since {profileData.joinDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="p-4 border rounded-lg text-center">
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <h3 className="font-medium mb-1">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Enrolled Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{course.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{course.code}</p>
                    </div>
                    <Badge variant={course.grade.startsWith('A') ? 'default' : 'secondary'}>
                      {course.grade}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive browser notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Course Updates</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Announcements and course changes</p>
                  </div>
                  <Switch
                    checked={notificationSettings.courseUpdates}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, courseUpdates: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Forum Mentions</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">When someone mentions you in forums</p>
                  </div>
                  <Switch
                    checked={notificationSettings.forumMentions}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, forumMentions: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Assignment Reminders</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reminders before assignment deadlines</p>
                  </div>
                  <Switch
                    checked={notificationSettings.assignmentReminders}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, assignmentReminders: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Toggle dark theme</p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Email Address</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Allow others to see your email</p>
                  </div>
                  <Switch
                    checked={privacySettings.showEmail}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, showEmail: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Phone Number</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Allow others to see your phone</p>
                  </div>
                  <Switch
                    checked={privacySettings.showPhone}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, showPhone: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Direct Messages</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Let others send you direct messages</p>
                  </div>
                  <Switch
                    checked={privacySettings.allowMessages}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, allowMessages: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg">
                <h3 className="font-medium text-red-800 mb-2">Delete Account</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}