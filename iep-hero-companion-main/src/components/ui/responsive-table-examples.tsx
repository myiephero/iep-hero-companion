// Usage examples for ResponsiveTable component
import React from "react";
import { ResponsiveTable, type ColumnDef, type RowAction } from "./responsive-table";
import { Badge } from "./badge";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Edit, Trash2, MessageSquare, Mail, Phone, Eye, User, GraduationCap, Calendar, Building2 } from "lucide-react";
import { getIEPStatusColor } from "@/lib/utils";
import type { Student } from "@/lib/api";
import type { Conversation, Message } from "@/lib/messaging";

// Example 1: Student List Table
interface StudentTableProps {
  students: Student[];
  loading?: boolean;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  onViewProfile?: (student: Student) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({ 
  students, 
  loading, 
  onEdit, 
  onDelete, 
  onViewProfile 
}) => {
  const columns: ColumnDef<Student>[] = [
    {
      header: "Student",
      accessor: "full_name",
      sortable: true,
      render: (name, student) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'S'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-muted-foreground">{student.grade_level}</div>
          </div>
        </div>
      ),
      mobileLabel: "Student"
    },
    {
      header: "School",
      accessor: "school_name",
      sortable: true,
      render: (school, student) => (
        <div>
          <div className="font-medium">{school || "—"}</div>
          {student.district && (
            <div className="text-sm text-muted-foreground">{student.district}</div>
          )}
        </div>
      ),
      mobileLabel: "School"
    },
    {
      header: "Disability",
      accessor: "disability_category",
      sortable: true,
      render: (category) => category ? (
        <Badge variant="outline">{category}</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
      mobileLabel: "Disability"
    },
    {
      header: "IEP Status",
      accessor: "iep_status",
      sortable: true,
      render: (status) => (
        <Badge className={getIEPStatusColor(status)}>
          {status || "Unknown"}
        </Badge>
      ),
      mobileLabel: "IEP Status"
    },
    {
      header: "Review Date",
      accessor: "next_review_date",
      sortable: true,
      render: (date) => date ? (
        <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
      mobileLabel: "Review Date",
      hiddenOnMobile: true
    }
  ];

  const actions: RowAction<Student>[] = [
    {
      label: "View Profile",
      icon: <Eye className="h-4 w-4" />,
      onClick: (student) => onViewProfile?.(student)
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (student) => onEdit?.(student)
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (student) => onDelete?.(student),
      variant: "destructive"
    }
  ];

  return (
    <ResponsiveTable
      data={students}
      columns={columns}
      actions={actions}
      loading={loading}
      emptyMessage="No students found"
      emptyIcon={<GraduationCap className="h-12 w-12" />}
      testIdPrefix="student"
      mobileCardTitle={(student) => student.full_name}
      mobileCardSubtitle={(student) => `${student.grade_level} • ${student.school_name || 'No school'}`}
    />
  );
};

// Example 2: Parent/Client List Table
interface Parent {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  students_count?: number;
  status: string;
  created_at: string;
}

interface ParentTableProps {
  parents: Parent[];
  loading?: boolean;
  onMessage?: (parent: Parent) => void;
  onEdit?: (parent: Parent) => void;
  onViewStudents?: (parent: Parent) => void;
}

export const ParentTable: React.FC<ParentTableProps> = ({ 
  parents, 
  loading, 
  onMessage, 
  onEdit, 
  onViewStudents 
}) => {
  const columns: ColumnDef<Parent>[] = [
    {
      header: "Parent",
      accessor: "full_name",
      sortable: true,
      render: (name, parent) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'P'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-muted-foreground">{parent.email}</div>
          </div>
        </div>
      ),
      mobileLabel: "Parent"
    },
    {
      header: "Contact",
      accessor: "phone",
      render: (phone, parent) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm font-mono">{parent.email}</span>
          </div>
          {phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-mono">{phone}</span>
            </div>
          )}
        </div>
      ),
      mobileLabel: "Contact",
      hiddenOnMobile: true
    },
    {
      header: "Students",
      accessor: "students_count",
      sortable: true,
      render: (count) => (
        <Badge variant="secondary">
          {count || 0} student{count !== 1 ? 's' : ''}
        </Badge>
      ),
      mobileLabel: "Students"
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      render: (status) => (
        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      ),
      mobileLabel: "Status"
    },
    {
      header: "Joined",
      accessor: "created_at",
      sortable: true,
      render: (date) => (
        <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
      ),
      mobileLabel: "Joined",
      hiddenOnMobile: true
    }
  ];

  const actions: RowAction<Parent>[] = [
    {
      label: "Send Message",
      icon: <MessageSquare className="h-4 w-4" />,
      onClick: (parent) => onMessage?.(parent)
    },
    {
      label: "View Students",
      icon: <User className="h-4 w-4" />,
      onClick: (parent) => onViewStudents?.(parent)
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (parent) => onEdit?.(parent)
    }
  ];

  return (
    <ResponsiveTable
      data={parents}
      columns={columns}
      actions={actions}
      loading={loading}
      emptyMessage="No parents found"
      emptyIcon={<User className="h-12 w-12" />}
      testIdPrefix="parent"
      mobileCardTitle={(parent) => parent.full_name}
      mobileCardSubtitle={(parent) => parent.email}
    />
  );
};

// Example 3: Conversation/Message List Table
interface ConversationTableProps {
  conversations: Conversation[];
  loading?: boolean;
  onOpenConversation?: (conversation: Conversation) => void;
  onArchive?: (conversation: Conversation) => void;
  onMarkUrgent?: (conversation: Conversation) => void;
}

export const ConversationTable: React.FC<ConversationTableProps> = ({ 
  conversations, 
  loading, 
  onOpenConversation, 
  onArchive, 
  onMarkUrgent 
}) => {
  const columns: ColumnDef<Conversation>[] = [
    {
      header: "Conversation",
      accessor: (conv) => conv.advocate?.name || conv.parent?.name || 'Unknown',
      sortable: true,
      render: (name, conversation) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'C'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{name}</div>
            <div className="text-sm text-muted-foreground truncate">
              {conversation.student?.name || 'No student'}
            </div>
          </div>
        </div>
      ),
      mobileLabel: "Participant"
    },
    {
      header: "Latest Message",
      accessor: (conv) => conv.latest_message?.content || '',
      render: (content, conversation) => (
        <div className="max-w-xs">
          <div className="text-sm truncate">
            {content || 'No messages yet'}
          </div>
          {conversation.latest_message && (
            <div className="text-xs text-muted-foreground">
              {new Date(conversation.latest_message.created_at).toLocaleDateString()}
            </div>
          )}
        </div>
      ),
      mobileLabel: "Latest Message"
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      render: (status, conversation) => (
        <div className="flex items-center gap-2">
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status}
          </Badge>
          {conversation.unread_count > 0 && (
            <Badge variant="destructive" className="text-xs">
              {conversation.unread_count}
            </Badge>
          )}
        </div>
      ),
      mobileLabel: "Status"
    },
    {
      header: "Priority",
      accessor: "priority",
      sortable: true,
      render: (priority) => (
        <Badge 
          variant={
            priority === 'urgent' ? 'destructive' : 
            priority === 'high' ? 'default' : 
            'secondary'
          }
        >
          {priority}
        </Badge>
      ),
      mobileLabel: "Priority"
    }
  ];

  const actions: RowAction<Conversation>[] = [
    {
      label: "Open",
      icon: <MessageSquare className="h-4 w-4" />,
      onClick: (conversation) => onOpenConversation?.(conversation)
    },
    {
      label: "Mark Urgent",
      icon: <Calendar className="h-4 w-4" />,
      onClick: (conversation) => onMarkUrgent?.(conversation),
      hidden: (conversation) => conversation.priority === 'urgent'
    },
    {
      label: "Archive",
      icon: <Building2 className="h-4 w-4" />,
      onClick: (conversation) => onArchive?.(conversation)
    }
  ];

  return (
    <ResponsiveTable
      data={conversations}
      columns={columns}
      actions={actions}
      loading={loading}
      emptyMessage="No conversations found"
      emptyIcon={<MessageSquare className="h-12 w-12" />}
      testIdPrefix="conversation"
      mobileCardTitle={(conv) => conv.advocate?.name || conv.parent?.name || 'Unknown'}
      mobileCardSubtitle={(conv) => conv.student?.name || 'No student assigned'}
      onRowClick={onOpenConversation}
    />
  );
};

// Example 4: Simple Data Table (Generic)
interface SimpleTableProps<T> {
  title: string;
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export const SimpleTable = <T,>({ 
  title, 
  data, 
  columns, 
  loading, 
  emptyMessage, 
  onRowClick 
}: SimpleTableProps<T>) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <ResponsiveTable
        data={data}
        columns={columns}
        loading={loading}
        emptyMessage={emptyMessage}
        onRowClick={onRowClick}
        sortable={true}
      />
    </div>
  );
};