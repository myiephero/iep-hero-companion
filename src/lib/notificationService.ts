/**
 * NotificationService - Centralized service for handling IEP-specific notifications
 * This service provides typed notification creators for various IEP-related events
 */

export interface IEPNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export class NotificationService {
  /**
   * IEP Meeting Reminder Notifications
   */
  static createIEPMeetingReminder(studentName: string, meetingDate: string, daysUntil: number): IEPNotification {
    const urgencyLevel = daysUntil <= 1 ? 'urgent' : daysUntil <= 3 ? 'high' : 'normal';
    const timeFrame = daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`;
    
    return {
      title: `IEP Meeting Reminder`,
      body: `${studentName}'s IEP meeting is scheduled ${timeFrame} (${meetingDate})`,
      data: {
        type: 'iep_meeting_reminder',
        studentName,
        meetingDate,
        daysUntil,
        route: '/parent/schedule'
      },
      badge: 1,
      category: 'iep_meeting',
      priority: urgencyLevel,
      sound: urgencyLevel === 'urgent' ? 'urgent.wav' : 'default.wav'
    };
  }

  /**
   * Document Analysis Complete Notifications
   */
  static createDocumentAnalysisComplete(documentName: string, analysisType: string, studentName?: string): IEPNotification {
    return {
      title: 'Document Analysis Complete',
      body: `AI analysis of "${documentName}" is ready${studentName ? ` for ${studentName}` : ''}`,
      data: {
        type: 'document_analysis_complete',
        documentName,
        analysisType,
        studentName,
        route: '/parent/tools/unified-iep-review'
      },
      badge: 1,
      category: 'document_analysis',
      priority: 'normal',
      sound: 'success.wav'
    };
  }

  /**
   * New Message Notifications
   */
  static createNewMessage(senderName: string, messagePreview: string, conversationType: string = 'general'): IEPNotification {
    return {
      title: `New message from ${senderName}`,
      body: messagePreview.length > 80 ? messagePreview.substring(0, 80) + '...' : messagePreview,
      data: {
        type: 'new_message',
        senderName,
        conversationType,
        route: '/parent/messages'
      },
      badge: 1,
      category: 'message',
      priority: conversationType === 'urgent' ? 'urgent' : 'normal',
      sound: 'message.wav'
    };
  }

  /**
   * Goal Progress Update Notifications
   */
  static createGoalProgressUpdate(studentName: string, goalTitle: string, progressPercentage: number): IEPNotification {
    const milestone = progressPercentage >= 100 ? 'completed' : 
                     progressPercentage >= 75 ? 'nearly complete' :
                     progressPercentage >= 50 ? 'halfway complete' : 'showing progress';
    
    return {
      title: `Goal Progress Update`,
      body: `${studentName}'s goal "${goalTitle}" is ${milestone} (${progressPercentage}%)`,
      data: {
        type: 'goal_progress_update',
        studentName,
        goalTitle,
        progressPercentage,
        route: '/parent/tools/goal-generator'
      },
      badge: 1,
      category: 'goal_progress',
      priority: progressPercentage >= 100 ? 'high' : 'normal',
      sound: progressPercentage >= 100 ? 'achievement.wav' : 'progress.wav'
    };
  }

  /**
   * Accommodation Effectiveness Notifications
   */
  static createAccommodationUpdate(studentName: string, accommodationTitle: string, effectivenessRating: number): IEPNotification {
    const status = effectivenessRating >= 4 ? 'highly effective' :
                   effectivenessRating >= 3 ? 'working well' :
                   effectivenessRating >= 2 ? 'showing some results' : 'needs adjustment';
    
    return {
      title: 'Accommodation Update',
      body: `${accommodationTitle} for ${studentName} is ${status} (${effectivenessRating}/5 stars)`,
      data: {
        type: 'accommodation_update',
        studentName,
        accommodationTitle,
        effectivenessRating,
        route: '/parent/autism-tools'
      },
      badge: 1,
      category: 'accommodation',
      priority: effectivenessRating <= 2 ? 'high' : 'normal',
      sound: 'default.wav'
    };
  }

  /**
   * Subscription and Plan Notifications
   */
  static createSubscriptionUpdate(planName: string, eventType: 'upgrade' | 'downgrade' | 'renewal' | 'expiry', daysUntil?: number): IEPNotification {
    let title = 'Subscription Update';
    let body = '';
    let priority: IEPNotification['priority'] = 'normal';

    switch (eventType) {
      case 'upgrade':
        title = 'Plan Upgraded!';
        body = `Your account has been upgraded to ${planName}. Enjoy your new features!`;
        priority = 'normal';
        break;
      case 'renewal':
        title = 'Subscription Renewed';
        body = `Your ${planName} subscription has been renewed successfully.`;
        priority = 'normal';
        break;
      case 'expiry':
        if (daysUntil !== undefined) {
          title = daysUntil <= 3 ? 'Subscription Expiring Soon' : 'Subscription Reminder';
          body = daysUntil === 0 ? `Your ${planName} subscription expires today` :
                 daysUntil === 1 ? `Your ${planName} subscription expires tomorrow` :
                 `Your ${planName} subscription expires in ${daysUntil} days`;
          priority = daysUntil <= 3 ? 'high' : 'normal';
        }
        break;
    }

    return {
      title,
      body,
      data: {
        type: 'subscription_update',
        planName,
        eventType,
        daysUntil,
        route: '/parent/pricing'
      },
      badge: 1,
      category: 'subscription',
      priority,
      sound: eventType === 'upgrade' ? 'success.wav' : 'default.wav'
    };
  }

  /**
   * Weekly Progress Report Notifications
   */
  static createWeeklyProgressReport(studentName: string, completedGoals: number, totalGoals: number): IEPNotification {
    const completionRate = Math.round((completedGoals / totalGoals) * 100);
    const encouragement = completionRate >= 80 ? 'Excellent progress!' :
                         completionRate >= 60 ? 'Good work!' :
                         completionRate >= 40 ? 'Keep it up!' : 'Every step counts!';

    return {
      title: 'Weekly Progress Report',
      body: `${studentName} completed ${completedGoals}/${totalGoals} goals this week. ${encouragement}`,
      data: {
        type: 'weekly_progress_report',
        studentName,
        completedGoals,
        totalGoals,
        completionRate,
        route: '/parent/tools/progress-analyzer'
      },
      badge: 1,
      category: 'progress_report',
      priority: 'normal',
      sound: 'report.wav'
    };
  }

  /**
   * Expert Analysis Available Notifications
   */
  static createExpertAnalysisReady(documentType: string, analysisType: string, studentName?: string): IEPNotification {
    return {
      title: 'Expert Analysis Ready',
      body: `Professional ${analysisType} analysis of your ${documentType} is now available${studentName ? ` for ${studentName}` : ''}`,
      data: {
        type: 'expert_analysis_ready',
        documentType,
        analysisType,
        studentName,
        route: '/parent/tools/expert-analysis'
      },
      badge: 1,
      category: 'expert_analysis',
      priority: 'high',
      sound: 'success.wav'
    };
  }

  /**
   * Urgent Alert Notifications (for critical situations)
   */
  static createUrgentAlert(title: string, message: string, actionRequired: string, route?: string): IEPNotification {
    return {
      title: `🚨 ${title}`,
      body: `${message} Action required: ${actionRequired}`,
      data: {
        type: 'urgent_alert',
        title,
        message,
        actionRequired,
        route: route || '/parent/dashboard'
      },
      badge: 1,
      category: 'urgent_alert',
      priority: 'urgent',
      sound: 'urgent.wav'
    };
  }

  /**
   * Send notification to specific users (helper method for backend)
   */
  static async sendNotificationToUsers(userIds: string[], notification: IEPNotification): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          userIds,
          title: notification.title,
          body: notification.body,
          data: notification.data,
          badge: notification.badge
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Schedule notification for later delivery (would integrate with backend scheduler)
   */
  static scheduleNotification(userId: string, notification: IEPNotification, scheduledFor: Date): void {
    // This would typically integrate with a backend job scheduler
    console.log('Scheduling notification:', {
      userId,
      notification,
      scheduledFor,
      description: `${notification.title}: ${notification.body}`
    });
  }
}