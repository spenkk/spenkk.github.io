---
layout: post
title: "Burp Suite Certified Practitioner Exam: Review and Insights"
summary: "In this blog post I will explain how I turned a Self-XSS to a Stored-XSS through IDOR."
categories: BugBounty
largeimage: /assets/images/57.png
author: arbennsh
---

*Note: The article was originally published [here](https://medium.com/p/f6630dc727eb), in Pretera's blog.*
&nbsp;

**Table of Contents:**

* TOC
{:toc}

# Introduction

Since I recently passed the BurpSuite Certified Practitioner exam, I felt it would be useful to share some of my experiences and lessons learned, with those who are considering taking this exam, or just interested in completing the PortSwigger Academy challenges.

# How did I prepare?

Despite the fact that I have spent several years testing web applications, there is always a need to learn new things, and because of this, I did not want to take the exam right away without first completing some challenges on different CTF platforms. I mostly focused on the PortSwigger Academy and completed all of the challenges, which are available for everyone. Even if you are unwilling to take the exam, I recommend completing these challenges (without checking the solutions) because they are all very realistic and are frequently discovered in day-to-day pentesting and bug bounty hunting. Recently, while testing for business logic vulnerabilities, I followed the same methodology that is used in PortSwigger labs. As a result, I found and reported multiple vulnerabilities in actual web apps.

&nbsp;
To take notes, I always use a markdown editor like Notion or Obsidian, in this case saving custom WAF bypass payloads and other useful things, so I can simply go back and check them. The below screenshot shows some of the notes I saved using for the “Insecure Deserialization” section.

&nbsp;
![image51]({{ site.baseurl }}/assets/images/56.png){:.images}

&nbsp;
Because the exam can only be taken using Burp Suite Professional, I went ahead and installed multiple extensions which could save me time from testing things manually. Some of them are as listed below:

&nbsp;
- Java Deserialization Scanner
- Backslash Powered Scanner
- HTTP Request Smuggler
- Turbo Intruder
- BurpBugFinder
- JWT Editor
- ParaMiner
- Agartha

&nbsp;
The “Java Deserialization Scanner” extension is highly useful for identifying vulnerable libraries when testing for deserialization issues. Although it’s not always accurate, it still gives you an idea of what to look for. Also, while generating payloads with the “ysoserial” tool, make sure to consider OOB payloads pointing to the “Exploit Server” or your “Burp Collaborator Server” since the output is not always displayed.

&nbsp;
I recently came across the “BurpBugFinder” extension, which checks all input for XSS and Error Based SQL Injection vulnerabilities. “Agartha” is another extension that can generate a lot of payloads for a given vulnerability, such as OS Command Injection, Path Traversal, etc.

&nbsp;
For labs that are focused on JWT vulnerabilities, “JWT Editor” is a must-have extension from which you can easily generate HS256/RS256 keys, conduct different attacks or simply edit the JWT via the Repeater tab. And for labs that are focused on HTTP Request Smuggling vulnerabilities, “HTTP Request Smuggler” can be useful to determining which type of vulnerabilities are affecting the web app, such as “CL.TE”, “TE.CL”, “H2.TE”, and so on.

&nbsp;
The PortSwigger academy has a “Mystery Challenge” option that helped me improve my recon skills. You don’t know what kind of vulnerability you’re looking for in this approach, so you’re putting your recon and analysis skills to the test.

# Exam duration and format

The exam lasts four hours and is proctored with the help of Examity. When you purchase the exam, Examity will send you an email asking you to create an account using the same email address that you use in PortSwigger. You will also be required to present verification documents (which could be your passport or ID card) and set some challenge questions which you will answer when the exam starts.

&nbsp;
A Burp Suite project file is requested from PortSwigger, if you finish the exam, so they can evaluate your work.

&nbsp;
*Note: Do not click on the “End Proctoring Session” in Examity tab until you finish the exam. Just leave that browser tab open.*

&nbsp;
Two web applications should be tested, with the main purpose of reading the file **”/home/carlos/secret”** on the server. Both online applications have distinct stages; you enter the web app as a “visitor” and must find a way to gain access as an authenticated user. This could be accomplished by identifying and exploiting a vulnerability such as Cross-Site Scripting, CSRF, Authentication vulnerabilities (brute-forcing your way in using the provided wordlists), HTTP Request Smuggling, OAuth vulnerabilities, JWT vulnerabilities, etc.

&nbsp;
You should use the provided ”Exploit Server” to deliver the payload to the victim for XSS, CSRF, and CORS vulnerabilities.

&nbsp;
After obtaining a valid session, the goal is to gain access to a more privileged account, in this case the administrator’s account. This could be accomplished by finding and exploiting a vulnerability such as SQL injection (use SQLmap to save time), XSS, CSRF, CORS, HTTP Request Smuggling, IDOR/Access Control, and so on.

&nbsp;
As previously stated, take notes and weaponize XSS payloads so you don’t waste time crafting them for attacks such as cookie stealing, etc. You will also come across WAFs, so if anything isn’t working properly, make slight modifications.

&nbsp;
After getting administrator privileges, you will be introduced to new functionality, and you must focus on server-side vulnerabilities such as XXE, Command Injection, Path Traversal, and so on in order to read the **”/home/carlos/secret”** file. There may be a function with two or more parameters; however, don’t focus solely on one as this may lead to a rabbit hole; instead, take a step back and try to understand the application logic and see what other testing could be performed there.

&nbsp;
While there are two web applications with three steps each, you must finish all nine steps to pass the exam.

&nbsp;
Due to the narrow time, I would rate the exam complexity as 7–8 on a scale of 1 to 10. Even though I finished it in under two hours, I got stuck for the first hour by focusing solely on a specific issue until I exploited it, after which the other steps became obvious.

# Conclusion

Burp Suite Certified Practitioner has a great value for money, for only 89 USD. The only issue is that you must have a valid Burp Suite Professional license to take the exam, which costs around 400 USD. The exam, in my opinion, could also be finished using the Burp Suite Community edition (if it was allowed).

&nbsp;
I would advise anyone interested in web application testing to take this exam and put their knowledge to the test. Or simply finish the free labs and the practice exam, which is equivalent to the final exam.

&nbsp;
![image51]({{ site.baseurl }}/assets/images/57.png){:.images}

&nbsp;
*Thank you for taking the time to read this, and I hope you'll find it useful.*
&nbsp;
