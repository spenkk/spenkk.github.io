---
layout: post
title: "CTF7E4 - Steganography Challenges"
categories: CTF7E4
---
## 1. Encrypted_File
&nbsp;
**Challenge Description:**{: style="color: red"}
We don't know what this file type is and what's inside it? But you have the necessary skills to decrypt it.


&nbsp;

> **→ unzip encrypted_file.zip**{: style="color: red"} 

```
Archive:  encrypted_file.zip
[encrypted_file.zip] encrypted_file password: xor2020
  inflating: encrypted_file     
```

> **→ file encrypted_file**{: style="color: red"} 
encrypted_file: PDF document, version 1.6

Since it's a PDF file, we can try to open it with a pdf viewer such as Evince.

&nbsp;
![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/encfile1.png){:.images}
&nbsp;

It seems that the file is password protected but we can use a tool such as pdfcrack to find the password.
&nbsp;

> **→ pdfcrack -f encrypted_file.pdf -w ~/tools/SecLists/Passwords/rockyou.txt**{: style="color: red"} 

```
PDF version 1.6
Security Handler: Standard
V: 2
R: 3
P: -4
Length: 128
Encrypted Metadata: True
FileID: 1dbc666fa98271932fab1b9a3862033d
U: 2377d319c13fca7931c663e3b009a79e28bf4e5e4e758a4164004e56fffa0108
O: 7ea64175cb40e99738dab9750de703581eb03788f45a694f8a8e2f7e7250c49f
found user-password: 'junior1'
```

&nbsp;
![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/encfile2.png){:.images}
&nbsp;


&nbsp;
&nbsp;
## 2. z1pped
&nbsp;
**Challenge Description:**{: style="color: red"}
What's the meaning of this image?
&nbsp;

> **→ curl unzip zipped.zip**{: style="color: red"} 

```
Archive:  zipped.zip
[zipped.zip] secret.png password: 
  inflating: secret.png 
```

&nbsp;
![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/zipped.png){:.images}
&nbsp;

> **→ binwalk secret.png**{: style="color: red"} 

```
DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             PNG image, 1980 x 1080, 8-bit/color RGB, non-interlaced
15364         0x3C04          Zip archive data, at least v1.0 to extract, name: secret/
15429         0x3C45          Zip archive data, at least v1.0 to extract, compressed size: 14, uncompressed size: 14, name: secret/.flag
15672         0x3D38          End of Zip archive, footer length: 22
```
&nbsp;
We can see that there's a zip file inside this image. To extract it we are going to use the command below.
&nbsp;

> **→ binwalk -e secret.png**{: style="color: red"} 

```
DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             PNG image, 1980 x 1080, 8-bit/color RGB, non-interlaced
15364         0x3C04          Zip archive data, at least v1.0 to extract, name: secret/
15429         0x3C45          Zip archive data, at least v1.0 to extract, compressed size: 14, uncompressed size: 14, name: secret/.flag
15672         0x3D38          End of Zip archive, footer length: 22
```

&nbsp;
> **→ ls**{: style="color: red"} 
secret.png  _secret.png.extracted  zipped.zip
&nbsp;

> **→ cat _secret.png.extracted/secret/.flag**{: style="color: red"}
XOR{\_z11p3d\_}

&nbsp;
&nbsp;

## 3. The Insider
&nbsp;
**Challenge Description:**{: style="color: red"}
I wonder what's behind this..
&nbsp;

> **→ unzip the_insider.zip**{: style="color: red"} 

```
Archive:  the_insider.zip
[the_insider.zip] TheInsider.jpg password: 
  inflating: TheInsider.jpg          
  inflating: xaa                     
  inflating: xab                     
  inflating: xac                     
  inflating: xad                     
  inflating: xae                     
  inflating: xaf                     
  inflating: xag                     
  inflating: xah
  ..[SNIP]..   
```
&nbsp;
&nbsp;
![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/theinsider1.jpg){:.images}
&nbsp;

> **→ cat xaa \| head -n 5**{: style="color: red"}

```
23456
12345
123456789
password
iloveyou
```
&nbsp;


> **→ cat xab \| head -n 5**{: style="color: red"} 

```
alexandra
alexis
jesus
estrella
miguel
```
&nbsp;
Looks like someone splitted a wordlist into many pieces. We can put it back together with the command below.
> **→ cat x* >> wordlist.txt**{: style="color: red"}

We are sure that there is something hidden inside that photo. We can use the tool below to find the exact password in order to extract the hidden data.
> **→ git clone https://github.com/Paradoxis/StegCracker.git**{: style="color: red"} 
> **→ sudo python3 setup.py install**{: style="color: red"} 
> **→ Stegcracker TheInsider.jpg ./wordlist.txt**{: style="color: red"} 

```
StegCracker 2.0.7 - (https://github.com/Paradoxis/StegCracker)
Copyright (c) 2020 - Luke Paris (Paradoxis)

Counting lines in wordlist..
Attacking file 'TheInsider.jpg' with wordlist './wordlist.txt'..
Successfully cracked file with password: francesca
Tried 3423 passwords
Your file has been written to: TheInsider.jpg.out
francesca
```

&nbsp;
> **→ Steghide extract -sf TheInsider.jpg**{: style="color: red"} 
Enter passphrase: francesca
wrote extracted data to "image1.jpg".

&nbsp;
![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/theinsider2.jpg){:.images}
&nbsp;

&nbsp;
I hope you had fun solving these challenges and learning something new.