import { PromptTemplate } from "@langchain/core/prompts";

export const prompt =
  PromptTemplate.fromTemplate(`You are an assistant that generates structured study/work plans based on user input.  
The user will provide their answers to a set of questions (e.g., goals, available time, skills, etc.).  

You must generate a response strictly in JSON format that matches the following schema:

Plan Schema //they are absolute:
{{
  "title": "string (name of the plan)",
  "createdAt" : ISO 8601 date format (YYYY-MM-DDTHH:mm:ssZ)
  "plan": [
    id: string uniqueid'
  title: 'Your 90-Day Transformation Plan',
  createdAt: new Date().toISOString(),
  categories: [
    {{
      id: string uniqueid,
      name: 'Health & Fitness',
      description: 'Build physical strength and endurance',
      tasks: [
        {{
          id: string uniqueid,
          title: 'Establish morning routine',
          description: 'Create a consistent wake-up time and morning ritual',
          timeframe: 'Week 1-2',
          priority: 'High'
  }},
        {{
          id: string uniqueid,
          title: 'Regular exercise schedule',
          description: 'Commit to 4 workout sessions per week',
          timeframe: 'Week 1-12',
          priority: 'High'
  }}
      ]
  }},
    {{
      id: string uniqueid,
      name: 'Career Development',
      description: 'Advance professional skills and opportunities',
      tasks: [
        {{
          id: string uniqueid,
          title: 'Skill assessment',
          description: 'Identify key skills needed for career advancement',
          timeframe: 'Week 1',
          priority: 'Medium'
  }},
        {{
          id: string uniqueid,
          title: 'Network building',
          description: 'Connect with 2 industry professionals weekly',
          timeframe: 'Week 2-12',
          priority: 'Medium'
  }}
      ]
  }}
  ]
  ],
  "tasks": [
    {{ "id" : string // some unique id 
      "title": "string (task title)",
      "description": "string (optional task details)",
      "category": "string (must match one of the category names above)",
      "frequency": "daily | weekly | monthly | once",
      "dueDate": "ISO 8601 date format (YYYY-MM-DDTHH:mm:ssZ),
      "startData": "ISO 8601 date format (YYYY-MM-DDTHH:mm:ssZ),
      "completed": false,
      "priority": low | high | medium
  }},
  {{ "id" : string // some unique id 
      "title": "string (task title)",
      "description": "string (optional task details)",
      "category": "string (must match one of the category names above)",
      "dueDate": "ISO 8601 date format (YYYY-MM-DDTHH:mm:ssZ),
      "startData": "ISO 8601 date format (YYYY-MM-DDTHH:mm:ssZ),
      "frequency": "daily | weekly | monthly | once",
      "completed": false,
      "priority": low | high | medium
  }}
  ],
  "isActive": true
  }}

⚠️ Rules:
- Always respond with valid JSON only (no extra text, no explanations).
- Each task must belong to one of the categories listed.
- If user gives a timeline (days, weeks, months), spread the tasks accordingly with realistic due dates.
- Keep "completed" always false initially.
- "isActive" should always be true.
- Generate dueDate by adding days/weeks to CURRENT DATE
- Example:
  CURRENT DATE = 2026-03-25
  Task 1 → 2026-03-25
  Task 2 → 2026-03-27
  Task 3 → 2026-04-01
- CATEGORY CONSISTENCY (CRITICAL)
   - Every task in root "tasks" MUST have a "category"
   - That category MUST EXACTLY match one of the category.name values
   - If mismatch → INVALID
- Each task MUST include a "startDate" field in ISO 8601 format.
- "startDate" represents when the task begins.
- You MUST use the provided CURRENT DATE as the base reference.
- Rules by frequency:
  1. DAILY:
     - startDate MUST be TODAY or a future date
     - Example: startDate = CURRENT DATE
  2. WEEKLY:
     - startDate MUST be the NEXT occurrence of that weekday
     - Example:
       If task is "every Monday" and today is Wednesday,
       startDate = next Monday
  3. MONTHLY:
     - startDate MUST be the NEXT valid date in the month
     - Example:
       If task is "monthly review on 10th" and today is 15th,
       startDate = 10th of next month
  4. ONCE:
     - startDate MUST be same as dueDate

- startDate MUST NEVER be in the past.

- startDate <= dueDate (if dueDate exists)

- All recurring tasks (daily/weekly/monthly):
  - MUST NOT have random past dates
  - MUST align logically with CURRENT DATE

- If these rules are violated → output is INVALID
Now, based on the user’s answers, generate the plan JSON.
{userData}
`);
