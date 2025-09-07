import { Router } from 'express';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { getUserId } from '../utils';
import { storage } from '../storage';

const router = Router();

// Parents/Clients routes - for advocates to see their clients
router.get('/parents', async (req: any, res) => {
  console.log('🔥 PARENTS ENDPOINT HIT!');
  try {
    const userId = await getUserId(req);
    console.log('🔥 USER ID EXTRACTED:', userId);
    if (userId === 'anonymous-user') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get advocate profile
    const advocate = await db.select().from(schema.advocates)
      .where(eq(schema.advocates.user_id, userId))
      .then(results => results[0]);
    
    if (!advocate) {
      return res.status(404).json({ error: 'Advocate profile not found' });
    }
    
    // Get all clients (parents) for this advocate
    const clientRelations = await db.select({
      relationship: schema.advocate_clients,
      client: schema.users
    })
    .from(schema.advocate_clients)
    .leftJoin(schema.users, eq(schema.advocate_clients.client_id, schema.users.id))
    .where(and(
      eq(schema.advocate_clients.advocate_id, advocate.id),
      eq(schema.advocate_clients.status, 'active')
    ));

    const clients = clientRelations.map(({ relationship, client }) => ({
      id: client?.id || '',
      email: client?.email || '',
      firstName: client?.firstName || '',
      lastName: client?.lastName || '',
      role: client?.role || 'parent',
      subscriptionPlan: client?.subscriptionPlan || 'Free Plan',
      specializations: [],
      // Add advocate relationship info
      relationship_status: relationship.status,
      created_at: relationship.created_at,
      case_type: relationship.case_type || 'general'
    }));
    
    console.log(`✅ Found ${clients.length} clients for advocate ${userId}`);
    res.json(clients);
  } catch (error) {
    console.error('Error fetching parents:', error);
    res.status(500).json({ error: 'Failed to fetch parents' });
  }
});

// Students endpoint - for advocates viewing their clients' students
router.get('/students', async (req: any, res) => {
  console.log('🔥 STUDENTS ENDPOINT HIT!');
  try {
    const userId = await getUserId(req);
    console.log('🔥 USER ID EXTRACTED:', userId);
    if (userId === 'anonymous-user') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if user is a parent or advocate
    const user = await storage.getUser(userId);
    let students = [];
    
    if (user?.role === 'advocate') {
      console.log('Fetching students for advocate:', userId);
      
      // For advocates, get their profile first
      const advocate = await db.select().from(schema.advocates)
        .where(eq(schema.advocates.user_id, userId))
        .then(results => results[0]);
      
      if (advocate) {
        console.log('Found advocate profile:', advocate.id);
        
        // Get students from multiple sources:
        // 1. From active cases
        const caseStudents = await db.select({
          student: schema.students,
          case: schema.cases,
          client: schema.users
        })
        .from(schema.cases)
        .leftJoin(schema.students, eq(schema.cases.student_id, schema.students.id))
        .leftJoin(schema.users, eq(schema.cases.parent_id, schema.users.id))
        .where(and(
          eq(schema.cases.advocate_id, advocate.id),
          eq(schema.cases.status, 'active')
        ));
        
        // 2. From direct advocate-client relationships where clients have students
        const clientStudents = await db.select({
          student: schema.students,
          client: schema.users
        })
        .from(schema.advocate_clients)
        .leftJoin(schema.users, eq(schema.advocate_clients.client_id, schema.users.id))
        .leftJoin(schema.students, eq(schema.students.parent_id, schema.users.id))
        .where(and(
          eq(schema.advocate_clients.advocate_id, advocate.id),
          eq(schema.advocate_clients.status, 'active')
        ));
        
        // Combine and deduplicate students
        const allStudents = [...caseStudents, ...clientStudents];
        const studentMap = new Map();
        
        allStudents.forEach(({ student, client }) => {
          if (student && !studentMap.has(student.id)) {
            studentMap.set(student.id, {
              ...student,
              parent: client ? {
                id: client.id,
                email: client.email,
                firstName: client.firstName,
                lastName: client.lastName
              } : null
            });
          }
        });
        
        students = Array.from(studentMap.values());
      }
    } else if (user?.role === 'parent') {
      // For parents, get their own students
      students = await db.select().from(schema.students)
        .where(eq(schema.students.parent_id, userId));
    }
    
    console.log(`✅ Found ${students.length} students for user ${userId}`);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// POST endpoint for creating students
router.post('/students', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (userId === 'anonymous-user') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { full_name, grade_level, school_name, disability_category, parent_id } = req.body;
    
    const [student] = await db.insert(schema.students)
      .values({
        full_name,
        grade_level,
        school_name,
        disability_category: disability_category || null,
        parent_id: parent_id || userId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();

    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

export { router as mainRoutes };