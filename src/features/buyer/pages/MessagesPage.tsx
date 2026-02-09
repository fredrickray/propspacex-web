"use client";

import { useState } from "react";
import {
  Search,
  Send,
  Paperclip,
  MoreHorizontal,
  Calendar,
  Video,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const conversations = [
  {
    id: 1,
    agent: "Agent Smith",
    company: "Apex Realty",
    property: "Downtown Luxury Apt",
    lastMessage: "The viewing is confirmed for tomorrow at 2 PM...",
    time: "10:30 AM",
    unread: true,
  },
  {
    id: 2,
    agent: "Sarah Jenkins",
    company: "Luxe Realty",
    property: "Seaside Villa #402",
    lastMessage: "Is the price negotiable for a cash offer?",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 3,
    agent: "Michael Chen",
    company: "City Homes",
    property: "Urban Loft 58",
    lastMessage: "Please send the documents when you have a...",
    time: "2 days ago",
    unread: false,
  },
  {
    id: 4,
    agent: "Sarah Connor",
    company: "Skyring Realty",
    property: "Mountain Retreat",
    lastMessage: "Thanks for the update.",
    time: "Oct 24",
    unread: false,
  },
];

const messages = [
  {
    id: 1,
    sender: "agent",
    text: "Hello! Thanks for your interest in the Downtown Luxury Apt. It's a fantastic unit with great views of the skyline. Do you have any specific questions about the amenities?",
    time: "Oct 26, 10:00 AM",
  },
  {
    id: 2,
    sender: "buyer",
    text: "Hi, yes I do. I would like to know if the parking space is included in the title deed? Also, are pets allowed in the building?",
    time: "10:05 AM",
  },
  {
    id: 3,
    sender: "agent",
    text: "Yes, one covered parking slot is included in the title deed. And regarding pets, the building is pet-friendly for animals under 25kg.",
    time: "10:15 AM",
  },
  {
    id: 4,
    sender: "agent",
    attachment: "floorplan_v2.pdf",
    text: "I've attached the floor plan above. Would you like to schedule a viewing?",
    time: "10:22 AM",
  },
];

const MessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(
    conversations[0],
  );
  const [messageText, setMessageText] = useState("");

  return (
    <div className="flex h-[calc(100vh-0px)]">
      {/* Conversations List */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold text-foreground mb-3">Inquiries</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search inquiries..." className="pl-9" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedConversation.id === conv.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      {conv.agent
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium text-sm text-foreground">
                        {conv.agent}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {conv.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {conv.company}
                    </p>
                    <p className="text-xs text-primary font-medium truncate">
                      {conv.property}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread && (
                    <div className="size-2 bg-primary rounded-full mt-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {selectedConversation.agent}
                </span>
                <Badge variant="secondary" className="text-xs">
                  Agent
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Regarding: {selectedConversation.property} - $850,000
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="size-4 mr-1" /> Schedule
            </Button>
            <Button size="sm">
              <Video className="size-4 mr-1" /> Make Offer
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "buyer" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-2 max-w-[70%] ${msg.sender === "buyer" ? "flex-row-reverse" : ""}`}
                >
                  {msg.sender === "agent" && (
                    <Avatar className="size-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>AS</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div
                      className={`rounded-2xl px-4 py-2.5 ${
                        msg.sender === "buyer"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.attachment && (
                        <div className="flex items-center gap-2 text-xs mb-2 opacity-80">
                          <Paperclip className="size-3" />
                          <span className="underline">{msg.attachment}</span>
                        </div>
                      )}
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    <p
                      className={`text-xs text-muted-foreground mt-1 ${msg.sender === "buyer" ? "text-right" : ""}`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 max-w-3xl mx-auto">
            <Button variant="ghost" size="icon">
              <Paperclip className="size-5" />
            </Button>
            <Input
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1"
            />
            <Button size="icon" className="bg-primary hover:bg-primary/90">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
