---
layout: post
title: "Self XSS to Stored XSS through IDOR"
summary: "In this blog post I will explain how I turned a Self-XSS to a Stored-XSS through IDOR."
categories: BugBounty
largeimage: /assets/images/50.png
author: arbennsh
---

&nbsp;
![image50]({{ site.baseurl }}/assets/images/50.png){:.images}
&nbsp;


**Table of Contents:**

* TOC
{:toc}

# Summary

&nbsp;
In this blog post I will explain how I turned a Self-XSS (cross-site scripting) vulnerability into a Stored-XSS by chaining it with an IDOR (insecure direct object reference) vulnerability. By chaining these two, I was able to turn a limited attack into a much more serious one. But first, let's define these terms:
&nbsp;

**XSS** (cross-site scripting) is a type of vulnerability that allows an attacker to inject malicious code into a website, which is then executed by the victim's browser, while on the other side, **IDOR** is a type of vulnerability that occurs when an application exposes internal object references, such as database IDs, in a way that allows an attacker to manipulate them. This can be exploited to access sensitive information or perform unauthorized actions.
&nbsp;

**Where did the vulnerability occur?**
&nbsp;

An admin user could create his own folder structure within the web application. The created folder's name was not properly sanitized, which allowed the attacker to inject malicious javascript code. Because only the owner of the folder could see and access it, this resulted in a Self-XSS. Due to the presence of an IDOR, an attacker could use it to increment the organization ID, transforming this vulnerability into a stored XSS that could attack other organization administrators and possibly takeover their accounts. Making it even worse, this could also be exploited from low-privileged users.
&nbsp;

Because there was no WAF (web application firewall) and the organizational IDs were easily guessable, this flaw was easily exploited and demonstrates the need of properly securing web applications and protecting them against all types of vulnerabilities.

# Steps


&nbsp;
I've logged into an admin account and proved that a folder containing a malicious payload was not present, as seen on the screenshot below.

&nbsp;
![image51]({{ site.baseurl }}/assets/images/51.png){:.images}
&nbsp;

Now using a low-privileged account, I've created a new folder and intercepted the request in order to modify the data before the folder is created on the backend.

&nbsp;
![image52]({{ site.baseurl }}/assets/images/52.png){:.images}
&nbsp;

As seen on the screenshot above, I modified the following data:
&nbsp;

```javascript
project_id=0
&parent_folder_id=7 //<- Admin's main folder
&company_id=10 //<- Admin's Company
&client_id= 
&folder_name=><img+src=x+onerror=alert(document.domain)>  // <- malicious payload
&addFolderBtn=+Add+
```

&nbsp;
Heading back to the admin account, we can see that the malicious folder has been created.
&nbsp;
![image53]({{ site.baseurl }}/assets/images/53.png){:.images}
&nbsp;

&nbsp;
In order for the payload to get executed, the victim, in this case the admin user should perform an action such as "Previewing" or "Moving" any of the present files inside that structure.

&nbsp;
![image54]({{ site.baseurl }}/assets/images/54.png){:.images}
&nbsp;

&nbsp;
![image55]({{ site.baseurl }}/assets/images/55.png){:.images}
&nbsp;

# Suggested Fix

In order to mitigate XSS (cross-site scripting) attacks, the below requirements should be followed (as suggested by [OWASP](https://owasp.org)):
&nbsp;
- Require strong input validation. Do not accept untrusted input or HTML content in your application unless required. If needed, perform HTML encoding.
- Always perform output encoding. Do not render or process input as it is. Perform encoding, escaping, or any technique to break the structure of a malicious payload so it is not rendered.
- Use libraries and software components, such as the [OWASP ESAPI](https://owasp.org/www-project-enterprise-security-api/), which provide reusable software components for input validation, escaping, and more.

&nbsp;

Whereas for IDOR (insecure direct object reference) the below checks should be in place:
&nbsp;

- **Use per user or session indirect object references**. This prevents attackers from directly targeting unauthorized resources
- **Check access**. Each use of a direct object reference from an untrusted source must include an access control check to ensure the user is authorized for the requested object.

&nbsp;
*Thank you for taking the time to read this, and I hope you'll find it useful.*
&nbsp;
