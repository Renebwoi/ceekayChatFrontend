import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import {
  Send,
  Paperclip,
  Smile,
  Reply,
  Heart,
  MoreHorizontal,
  Users,
  Pin,
  Search,
} from "lucide-react";

interface Message {
  id: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  replies: Reply[];
  likes: number;
  isPinned?: boolean;
}

interface Reply {
  id: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  likes: number;
}

interface OnlineUser {
  id: string;
  name: string;
  role: string;
  status: "online" | "away" | "offline";
}

interface ForumPageProps {
  forumId: string;
  user: { name: string; role: string };
}

export function ForumPage({ forumId, user }: ForumPageProps) {
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const forum = {
    id: forumId,
    title: "General Discussion",
    course: "CS201 - Data Structures & Algorithms",
    description: "General course discussions and announcements",
  };

  const messages: Message[] = [
    {
      id: "1",
      author: {
        name: "Dr. Sarah Wilson",
        role: "Lecturer",
        avatar: undefined,
      },
      content:
        "Welcome to the course! Please introduce yourselves and let me know your programming background. Also, remember that Assignment 1 is due next Friday at midnight.",
      timestamp: "2 hours ago",
      replies: [
        {
          id: "1-1",
          author: { name: "Alex Chen", role: "Student" },
          content:
            "Hi everyone! I'm Alex, CS major, and I have experience with Python and Java.",
          timestamp: "1 hour ago",
          likes: 3,
        },
        {
          id: "1-2",
          author: { name: "Maria Garcia", role: "Student" },
          content:
            "Hello! Maria here, Computer Engineering student. Looking forward to this course!",
          timestamp: "45 minutes ago",
          likes: 2,
        },
      ],
      likes: 8,
      isPinned: true,
    },
    {
      id: "2",
      author: {
        name: "John Smith",
        role: "Student",
        avatar: undefined,
      },
      content:
        "Quick question about the binary search tree implementation - should we use recursion or iteration for the insert method?",
      timestamp: "1 hour ago",
      replies: [
        {
          id: "2-1",
          author: { name: "Dr. Sarah Wilson", role: "Lecturer" },
          content:
            "Great question! Both approaches are valid. Try implementing it recursively first, then as a challenge, implement the iterative version.",
          timestamp: "30 minutes ago",
          likes: 5,
        },
      ],
      likes: 4,
    },
    {
      id: "3",
      author: {
        name: "Emma Thompson",
        role: "Student",
        avatar: undefined,
      },
      content:
        "Has anyone started working on the graph algorithms assignment? I'm having trouble understanding Dijkstra's algorithm.",
      timestamp: "45 minutes ago",
      replies: [],
      likes: 2,
    },
  ];

  const onlineUsers: OnlineUser[] = [
    { id: "1", name: "Dr. Sarah Wilson", role: "Lecturer", status: "online" },
    { id: "2", name: "Alex Chen", role: "Student", status: "online" },
    { id: "3", name: "Maria Garcia", role: "Student", status: "online" },
    { id: "4", name: "John Smith", role: "Student", status: "away" },
    { id: "5", name: "Emma Thompson", role: "Student", status: "online" },
    { id: "6", name: "David Lee", role: "TA", status: "online" },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Lecturer":
        return "bg-purple-100 text-purple-800";
      case "TA":
        return "bg-blue-100 text-blue-800";
      case "Admin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to the backend
      console.log($lf(184), "Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const handleSendReply = (messageId: string) => {
    if (replyContent.trim()) {
      // In a real app, this would send the reply to the backend
      console.log(
        $lf(175),
        "Sending reply to message",
        messageId,
        ":",
        replyContent
      );
      setReplyContent("");
      setReplyingTo(null);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Forum Header */}
      <div className="bg-white dark:bg-gray-900 border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{forum.title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {forum.course}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" size="sm">
              <Pin className="h-4 w-4 mr-2" />
              Pinned
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="group">
                  <Card
                    className={`${
                      message.isPinned
                        ? "border-blue-200 bg-blue-50 dark:bg-blue-950"
                        : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      {message.isPinned && (
                        <div className="flex items-center text-blue-600 text-xs mb-2">
                          <Pin className="h-3 w-3 mr-1" />
                          Pinned Message
                        </div>
                      )}

                      <div className="flex items-start space-x-3">
                        <Avatar>
                          <AvatarImage src={message.author.avatar} />
                          <AvatarFallback>
                            {getInitials(message.author.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">
                              {message.author.name}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getRoleColor(
                                message.author.role
                              )}`}
                            >
                              {message.author.role}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {message.timestamp}
                            </span>
                          </div>

                          <p className="text-gray-900 dark:text-gray-100 mb-2">
                            {message.content}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <button className="flex items-center space-x-1 hover:text-red-500">
                              <Heart className="h-4 w-4" />
                              <span>{message.likes}</span>
                            </button>
                            <button
                              className="flex items-center space-x-1 hover:text-blue-500"
                              onClick={() => setReplyingTo(message.id)}
                            >
                              <Reply className="h-4 w-4" />
                              <span>Reply</span>
                            </button>
                            <button className="opacity-0 group-hover:opacity-100 hover:text-gray-700">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Replies */}
                          {message.replies.length > 0 && (
                            <div className="mt-3 ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-3">
                              {message.replies.map((reply) => (
                                <div key={reply.id} className="group/reply">
                                  <div className="flex items-start space-x-2">
                                    <Avatar className="w-6 h-6">
                                      <AvatarFallback className="text-xs">
                                        {getInitials(reply.author.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-sm font-medium">
                                          {reply.author.name}
                                        </span>
                                        <Badge
                                          variant="secondary"
                                          className={`text-xs ${getRoleColor(
                                            reply.author.role
                                          )}`}
                                        >
                                          {reply.author.role}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                          {reply.timestamp}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {reply.content}
                                      </p>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-500">
                                          <Heart className="h-3 w-3" />
                                          <span>{reply.likes}</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Input */}
                          {replyingTo === message.id && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <Textarea
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) =>
                                  setReplyContent(e.target.value)
                                }
                                className="mb-2"
                              />
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setReplyingTo(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSendReply(message.id)}
                                >
                                  Reply
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t bg-white dark:bg-gray-900">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[80px] pr-20"
                />
                <div className="absolute bottom-2 right-2 flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Online Users Sidebar */}
        <div className="w-64 border-l bg-gray-50 dark:bg-gray-900">
          <div className="p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Online ({onlineUsers.filter((u) => u.status === "online").length})
            </h3>

            <div className="space-y-2">
              {onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                        user.status
                      )}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function $lf(n: number) {
  return "$lf|components/ForumPage.tsx:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
