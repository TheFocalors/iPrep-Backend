import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  AIChatMessage,
  BaseChatMessage,
  ChatMessage,
  HumanChatMessage,
  StoredMessage,
  SystemChatMessage,
} from 'langchain/schema';

import {
  AIMessagePromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';

import { AppConfigModule } from '@/lib';
import { OpenAIModule } from '@/modules/openai/openai.module';
import { OpenAIService } from '@/modules/openai/openai.service';

import { LLMChain } from 'langchain/chains';

@Module({
  imports: [AppConfigModule, OpenAIModule],
})
class LangchainTestModule {}

class ReviewerChatMessage extends AIChatMessage {
  constructor(text: string) {
    super(text);
  }
}

async function test() {
  const app = await NestFactory.create<NestExpressApplication>(
    LangchainTestModule,
  );

  const openAIService = app.get<OpenAIService>(OpenAIService);
  const model = openAIService.chatModel;

  const systemPrompt = `
  SYSTEM:
      Roles: SYSTEM, AI, HUMAN, REVIEWER
      RULES:
      - I want you to act as an interviewer from {company}.
      - This company is based in {companyLocation}. HUMAN role will be the candidate and AI role will ask the HUMAN the interview questions for the position of {title}.
      - AI only replies as the interviewer. Do not write all the conservation at once.
      - AI only do the interview with HUMAN. Ask HUMAN the questions and wait for the HUMAN to answer.
      - AI does not write explanations. AI Asks HUMAN the questions individually like an interviewer and waits for the HUMAN answers.
      - If the SYSTEM asks for FEEDBACK, REVIEWER reply with feedback based on the interview session. Give the feedback honestly.
      - If the interview is DONE, REVIEWER reply the feedback, AI reply with closing, and SYSTEM reply DONE.
      - DO NOT use numbering on the questions.
      - In one message, REVIEWER, SYSTEM, and AI can talk together.
      - In this interview there are AI as INTERVIEWER, HUMAN as CANDIDATE, and REVIEWER as REVIEWER.`;

  const jobDescriptionPrompt = `
  SYSTEM:
      Job title: {title}
  Company name: {company}
  Responsibilities: {responsibilities}
  Qualifications: {qualifications}
  Requirements Skills: {skills}
  City: {city}
  Type: {type}
  `;

  const initialMessage = 'HUMAN: Hello';

  const intialInterviewPromptTemplate = ChatPromptTemplate.fromPromptMessages([
    HumanMessagePromptTemplate.fromTemplate(systemPrompt),
    HumanMessagePromptTemplate.fromTemplate(jobDescriptionPrompt),
    HumanMessagePromptTemplate.fromTemplate(initialMessage),
  ]);

  // const intialInterviewChat = await intialInterviewPromptTemplate.format({
  //   company: 'PT Reka Multi Aptika',
  //   companyLocation: 'Jakarta Pusat',
  //   title: 'Backend Developer',
  //   responsibilities:
  //     'Have a minimum 2 years of experience, Knowledge in HTML, CSS, JavaScript, jQuery, Bootstrap is plus, Understanding of object-oriented PHP programming, Proficiency in PHP and Laravel framework, Proficiency in REST API, Proficiency in code version tools, such as Git, Strong attention to detail, analytical and problem-solving skill, Experienced working in teams, Can join ASAP',
  //   qualifications:
  //     'Build scalable and robust web application, Build reusable code and libraries for future use, Optimize code and application for maximum speed and scalability, Troubleshooting application and code issues, Implement security and data protection, Integration of data storage solutions, Performance tuning, improvement, balancing, usability, automation, Work collaboratively with design team to understand end user requirements to provide technical solutions and for the implementation of new software features, Continuously discover, evaluate, and implement new technologies to maximize development efficiency',
  //   skills:
  //     'JavaScript, jQuery, HTML, Bootstrap, CSS, Rest API, PHP Laravel Framework, Git',
  //   city: 'Jakarta Pusat',
  //   type: 'Full Time',
  // });

  const chain = new LLMChain({
    llm: model,
    prompt: intialInterviewPromptTemplate,
  });

  const response = await intialInterviewPromptTemplate.format({
    company: 'PT Reka Multi Aptika',
    companyLocation: 'Jakarta Pusat',
    title: 'Backend Developer',
    responsibilities:
      'Have a minimum 2 years of experience, Knowledge in HTML, CSS, JavaScript, jQuery, Bootstrap is plus, Understanding of object-oriented PHP programming, Proficiency in PHP and Laravel framework, Proficiency in REST API, Proficiency in code version tools, such as Git, Strong attention to detail, analytical and problem-solving skill, Experienced working in teams, Can join ASAP',
    qualifications:
      'Build scalable and robust web application, Build reusable code and libraries for future use, Optimize code and application for maximum speed and scalability, Troubleshooting application and code issues, Implement security and data protection, Integration of data storage solutions, Performance tuning, improvement, balancing, usability, automation, Work collaboratively with design team to understand end user requirements to provide technical solutions and for the implementation of new software features, Continuously discover, evaluate, and implement new technologies to maximize development efficiency',
    skills:
      'JavaScript, jQuery, HTML, Bootstrap, CSS, Rest API, PHP Laravel Framework, Git',
    city: 'Jakarta Pusat',
    type: 'Full Time',
  });

  // const responseA = await model.call([
  //   new HumanChatMessage(`
  //     SYSTEM:
  //     Roles: SYSTEM, AI, HUMAN, REVIEWER
  //     RULES:
  //     - I want you to act as an interviewer from PT Reka Multi Aptika.
  //     - This company is based in Jakarta Pusat. HUMAN role will be the candidate and AI role will ask the HUMAN the interview questions for the position of Backend Developer.
  //     - AI only replies as the interviewer. Do not write all the conservation at once.
  //     - AI only do the interview with HUMAN. Ask HUMAN the questions and wait for the HUMAN to answer.
  //     - AI does not write explanations. AI Asks HUMAN the questions individually like an interviewer and waits for the HUMAN answers.
  //     - If the SYSTEM asks for FEEDBACK, REVIEWER reply with feedback to the candidate based on the interview session. Give the feedback honestly.
  //     - If the interview is DONE, REVIEWER reply the feedback, AI reply with closing, and SYSTEM reply DONE.
  //     - DO NOT use numbering on the questions.
  //     - In one message, REVIEWER, SYSTEM, and AI can talk together.
  //     - In this interview there are AI as INTERVIEWER, HUMAN as CANDIDATE, and REVIEWER as REVIEWER.
  //     `),
  //   new HumanChatMessage(`
  //     SYSTEM:
  //     Job title: Backend Developer
  // Company name: PT Reka Multi Aptika
  // Responsibilities: Have a minimum 2 years of experience, Knowledge in HTML, CSS, JavaScript, jQuery, Bootstrap is plus, Understanding of object-oriented PHP programming, Proficiency in PHP and Laravel framework, Proficiency in REST API, Proficiency in code version tools, such as Git, Strong attention to detail, analytical and problem-solving skill, Experienced working in teams, Can join ASAP
  // Qualifications: Build scalable and robust web application, Build reusable code and libraries for future use, Optimize code and application for maximum speed and scalability, Troubleshooting application and code issues, Implement security and data protection, Finalize back-end features and testing web applications
  // Skills: JavaScript, jQuery, HTML, Bootstrap, CSS, Rest API, PHP Laravel Framework, Git
  // City: Jakarta Pusat
  // Type: FULL_TIME
  // User Location: Surabaya
  // Distance from user: 661.71 km`),
  //   new AIChatMessage(
  //     'AI: Hello, thank you for coming in today. Can you please start by introducing yourself?',
  //   ),
  //   new HumanChatMessage(
  //     'HUMAN: I am proficient in Java, C++, JavaScript, C#, Ruby and Python. Of these programming languages, I feel most comfortable working with Java, C# and C++. In my previous role, I worked mainly with Java to create applications that worked across multiple platforms. I also used C++ to develop a new operating system that worked with the applications I engineered. Using C#, I was able to improve my productivity when developing web-based apps and software',
  //   ),
  //   new AIChatMessage(
  //     'AI: Okay, that sounds great. Can you also tell me about your experience working with Git? Have you used any other code version tools?',
  //   ),
  //   new HumanChatMessage(
  //     'HUMAN: I have used Git for version control in my previous role. I have also used SVN and Mercurial. I am comfortable using all three tools.',
  //   ),
  //   new AIChatMessage(
  //     'AI: Thats a good use of Git. Can you tell me about your experience with Laravel? What kind of projects have you worked on using this framework?',
  //   ),
  //   new HumanChatMessage('SYSTEM: STOP'),
  // ]);

  console.log(JSON.parse(response));

  // BaseChatMessage
  model.call(JSON.parse(response));
}

test();
