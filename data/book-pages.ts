import type { BookPage } from "@/lib/types"

export const bookPages: BookPage[] = [
  {
    title: "Welcome to the Department of Computing Freshers Guide",
    body: "Our department is dedicated to providing world-class education in computer science and preparing students for successful careers in technology. With state-of-the-art facilities and renowned faculty, we offer a comprehensive curriculum that covers both theoretical foundations and practical applications.",
    image: "/book7.png",
  },
  {
    title: "Our Mission",
    body: "We strive to foster innovation, critical thinking, and ethical responsibility in computing. Our mission is to educate the next generation of technology leaders who will shape the future of computing and make positive contributions to society.",
    image: "/logo cta.png",
  },
  {
    title: "Research Excellence",
    body: "Our faculty members are engaged in cutting-edge research across various domains including artificial intelligence, cybersecurity, data science, and software engineering. Students have opportunities to participate in research projects and contribute to advancing the field.",
    image: "/NTP_9104.jpg",
  },
  {
    title: "Student Life",
    body: "Beyond academics, we offer a vibrant student community with numerous clubs, hackathons, and networking events. Our students regularly compete in programming competitions and collaborate on innovative projects that solve real-world problems.",
    image: "/images book1.jpg",
  },
  {
    title: "Career Opportunities",
    body: "Our graduates are highly sought after by leading technology companies worldwide. With a strong emphasis on practical skills and industry connections, we ensure our students are well-prepared for successful careers in software development, data science, cybersecurity, and more.",
    image: "/banner.png",
  },
  {
    title: "Join Us",
    body: "Whether you are a prospective student, researcher, or industry partner, we invite you to join our community. Together, we can push the boundaries of what is possible in computer science and create innovative solutions for tomorrow's challenges.",
    image: "/comp-95.jpg",
  },
  {
    
    title: "Programmes, Majors & Minors",
    body: 'Here’s a look at the programmes, majors and minors offered by the Department of Computing:\n\n'+

      'Programmes (BSc. in):\n'+
      '1. Computer Studies\n' +
      '2. Computer Systems Engineering (Not offered in 2023/2024)\n' +
      '3. Information Technology\n' +
      '4. Software Engineering [Mobile Application Technology] (Not offered in 2023/2024)' ,

    image: "/pic_hero.jpg",

  },
  {
    body:
    'Majors:\n'+
      '1. Computer Science\n' +
      '2. Software Engineering\n' +

      'Minors:\n'+
      '1. Computer Science\n' +
      '2. Software Engineering\n' +
      '3. Information Technology\n'+

      'Note:\n'+
      '- Majors, minors and the courses needed for each, are outlined by the university in the respective faculties’ handbook.\n' + 
      '- Minors and secondary majors are declared in your second year of study.\n',

    image: "/pic_hero.jpg",
  },
  {
    title: "Courses & Credits",
    body: 
    '• For any degree in the Faculty of Science and Technology one must have 24 level one credits and 18 FST credits.\n' +  
    '• The minimum number of credits you may do for semester one is 15 credits and the maximum is 18 credits. The minimum amount for semester 2 is 18 credits and the maximum amount is 21 credits.\n' +  
    '• To meet the credit requirements if there are limited 1st year courses in your major, you would choose free electives. Free electives are courses you take outside of your major in order to obtain additional credits for your degree.\n' + 
    '• Note:\n '+
    'that foundation courses do not count towards the 24 level one credits required.',

  },
  {
  title: "Core Year 1 Courses",
  body: "The following courses are needed to matriculate into second year and are prerequisites for level 2 computing courses.",
  tableData: [
    ["Semester 1", "Semester 2", "Semester 1 or 2"],
    ["COMP1126", "COMP1161", "COMP1210"],
    ["COMP1127", "", "COMP1220"],
    ["", "", "FOUN1014"]
  ],
  },
  {
    title: "Core Year 1 Courses",
    body: "Here is a sample of a student’s course year plan that meets all requirements.",
    image: "/book1.png",
    
  },

  {
    title: "Electives",
    body:"Here are some electives you may consider registering for. Please note that this list is not exhaustive.",
    tableData: [
      ["In Faculty", "Out of Faculty"],
      ['- MATH1141', '- ECON1000'],
      ['- MATH1151', '- ECON1003'],
      ['- BIOC1016', '- MDIA1001']
    ],
  },

  {
    body: "Plan your FST Degree ",
    linkText: "here",
    link:"https://view.officeapps.live.com/op/view.aspx?src=https%3A%2F%2Fwww.mona.uwi.edu%2Ffst%2Fsites%2Fdefault%2Ffiles%2Ffpas%2Fuploads%2F2022_degree_plan_template_1.xlsx&wdOrigin=BROWSELINK",
    image: "/book2.png",
  },

  {
    title: "Websites & Computing Resources",
    subtitle: "1. Hackerrank",
    link: "https://www.hackerrank.com/",
    body: 
    '- This is used for weekly graded coding challenges and projectsthat are given by the lecturers.\n'+
    '- Challenges are normally a week long so you will have time to complete before it is closed.\n'+
    '- Can be used to practice other challenges outside of class.\n'+
    '- WebView',
    image: "/book3.png",
  },

  {
    subtitle: "2. Replit",
    link: "https://replit.com/login",
    body: 
    '-Used for marking labs online.\n'+ 
    '- Makes project collaboration easier.\n'+
    '- WebView:',
    image: "/book4.png",
  },

  {
    body: "-Mobile View ",
    image: "/book5.png",
  },

  {
    title: "Other Useful Websites",
    sections: [
      {
        subtitle: "- PythonTutor:",
        link: "https://pythontutor.com/",
        body: 'This tool helps you learn Python, JavaScript, C,'+
        'C++, and Java programming by visualizing code execution. You can '+
        'use it to debug your homework assignments and as a supplement to online coding tutorials.',
      },
      {
        subtitle: "- Github",
        link: "https://github.com/",
        body:" GitHub is a code hosting platform for version control and collaboration. It lets you and others work together on projects from anywhere. ",
      },
      {
        subtitle: "- W3Schools:",
        link:"https://www.w3schools.com/",
        body:" W3Schools is a website offering courses for learning how to write code and programs using various programming languages. ",
      },
      
    ],
  },
  {
    sections: [
      {
        subtitle: "- Stack Overflow",
        link: "https://stackoverflow.com",
        body: " Stack Overflow is a question-and-answer site for professional and enthusiast programmers. It is a good place to search for answers when you have problems with your code. ",
      },
      {
        subtitle: "- GeeksForGeeks",
        link: "https://www.geeksforgeeks.org/",
        body: "GeeksForGeeks is a Computer Science portal. It contains written, explained computer science and programming articles, quizzes and practice/competitive programming/company interview Questions. "
      },
    ],
    
    body: "Access resources for your level one computing courses",
    linkText: "here",
    link: "https://drive.google.com/drive/folders/14sN8y54w3CljOm3sZ5xtnW-nyUDayOPb",
  },

  {
    title: "Course Registration Process",
    body: 'Registration opened on July 3, 2023. For now, things you need to know:\n'+

      '1. Some courses may require an override before you can register. In the space provided, add your reason for requesting the override, your ID number and your email address (in case the lecturer granting the override wants to contact you). Follow up with an email to the undergraduate coordinator, Dr. Paul Gaynor,\n\n'+
      '2. Register for courses early.\n\n'+ 
      '3. Ensure you have no clashes among courses.\n\n'+ 
      '4. Select courses for the time you feel is best for you.\n\n',

  },

  {
    title: "Frequently Asked Questions ",
    sections: [
      {
        subtitle: "What is a major? ",
        body: "- Well, your major is any specific subject area you choose to specialise in during your time at university.",
      },
      {
        subtitle: "What is a minor? ",
        body: "- On the other hand, a minor is a subject area in which you wish to learn about but not in depth. ",
      },
      {
        subtitle: "Can I double major or double minor? ",
        body: "- Yes, you can double major or double minor in any major or minor that is offered by the university, as long as it's not within the same department.",
      },
    ]
  },
  {
    sections: [
      {
        subtitle: "What is a primary tutorial and what is a secondary tutorial? ",
        body: "- Both primary and secondary tutorials are ungraded worksheets that are done in tutorial sessions and contributes to your knowledge of the topic being covered. ",
      },
      {
        subtitle: "Do I have to Pay more money to double major or minor? ",
        body: "- No. ",
      },
      {
        subtitle: "Do COMP1126 & COMP1127 clash? ",
        body: "- No, the days and times you register for your COMP1126 sections are supposed to match your COMP1127 sections. COMP1126 is for half of the semester (6 weeks) and COMP1127 is for the other half (6 weeks). ",
      },
    ],
  },
  {
    sections: [
      {
        subtitle: "What coding languages do we learn? ",
        body: "- You will learn Python and Java.",
      },
      {
        subtitle: "What are the requirements to pass computing courses? ",
        body: "- To pass computing courses you must pass both the coursework and exam components. ",
      }
    ]
  },

  {
    title: "Computing Staff ",
    subtitle: "Administrative Staff ",
    tableData: [
    ["Lecturer’s Name", "Position ", "Email"],
    ["Bruce Hoo Fung ", "Senior Computer Technologist", "computingsupport@uwimona.edu.jm"]
  ],
  },
  {
    subtitle: "Academic Staff (Undergraduate Courses) ",
    tableData: [
    ["Lecturer’s Name", "Position ", "Email"],
    ["Dr. Daniel Fokum", "Senior Computer Technologist", "daniel.fokum@uwimona.edu.jm"],
    ["Dr. Paul Gaynor", "Undergraduate Coordinator & Academic Advisor", "paul.gaynor@uwimona.edu.jm"],
    ["Mr. Sean Miller", "Student Experience Liaison ", "sean.miller02@uwimona.edu.jm"],
    ["Dr. Phillipa Bennett", "Lecturer", "phillipa.bennett@uwimona.edu.jm"],
  ],    
  },

  {
    subtitle: "Academic Staff (Undergraduate Courses) ",
    tableData: [
    ["Dr. Carl Beckford", "Graduate Coordinator ", "carl.beckford@uwimona.edu.jm"],
    ["Mr. Alton Bodley ", "Computing Data Controller", "alton.bodley@uwimona.edu.jm"],
    ["Dr. Ashley G. Hamilton Taylor", "Lecturer", "ashley.taylor@uwimona.edu.jm"],
    ["Dr. Gunjan Mansingh ", "Lecturer", "gunjan.mansingh@uwimona.edu.jm"],
    ],
  },
  
  {
    subtitle: "Academic Staff (Undergraduate Courses)",
    tableData: [
    ["Dr. Claudine Allen ", "Lecturer", "claudine.allen@uwimona.edu.jm"],
    ["Mr. Christopher Muir ", "Lecturer", "christopher.muir@uwimona.edu.jm"],
    ["Mr. Jeremy-Dane Ferguson ", "Lecturer", "jeremy.ferguson@uwimona.edu.jm"],
    ["Dr. Curtis Busby-Earle", "Lecturer", "curtis.busbyearle@uwimona.edu.jm"],
    ["Dr. Kirk Morgan", "Lecturer", "kirk.morgan02@uwimona.edu.jm"],
    ],
  },

  {
    subtitle: "Academic Staff (Graduate Courses) ",
    tableData: [
    ["Dr. Carl Beckford", "Graduate Coordinator ", "carl.beckford@uwimona.edu.jm"],
    ],
  },

  {
    subtitle: "Final Tips",
    body: 'As you wrap up your first year in the Department of Computing, remember that'+
     ' your academic journey is a marathon, not a sprint. Ensuring you stay within the credit limits—15'+
     ' to 18 credits for Semester 1 and 18 to 21 credits for Semester 2—is key to maintaining a balanced'+
     ' workload. Your primary goal is to achieve the 24 level-one credits required to matriculate into your'+
     ' second year. If you ever feel overwhelmed or need technical help, do not hesitate to reach out to the staff'+
      'or use the resources like PythonTutor and HackerRank listed in this guide.',
    image: "/book6.jpg",
  }
]
