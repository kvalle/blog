---
date: 2012-05-27
title: Taming the photo collection
description: Organizing photos from different devices using different naming schemes can be a pain. So I wrote a tool to deal with this for me.
---

I recently decided to organize my steadily growing collection of photos.
It turns out I had over 20.000 photos collected during the last 10 year or so.
Organizing such an amount of images is in itself a daunting task, but the situation was further compounded by the fact that the images originated from a myriad of different sources, such as my camera phone, my compact camera, and so on.
Each device had of course been using a different naming scheme, ensuring that no consistent chronological order could be found among the files.

I soon realized that without first sorting the photos into a single coherent timeline, I would never have the patience to organize them all.
What I needed to do was to store all images chronologically, preferably with timestamps used for file names (which is, incidentally, what my Samsung G2 did).

After searching a bit without finding a good tool to do this, I decided to write my own.
Python is my scripting language of choice, and the [Python Imaging Library](http://www.pythonware.com/products/pil/) fortunately had all the required methods for reading the [exif data](http://en.wikipedia.org/wiki/Exif) I needed, namely the `DateTimeOrignal` field, i.e. the time at which the photo was taken.

I started hacking, and soon had a script doing what I wanted.
I ran it on the photos, making the them considerably more manageable.

The script as a whole is a bit too long to embed here, but can be found in [this github repository](https://github.com/kvalle/img-rename).
If you find it useful or have ideas for improvements I always welcome a comment, or even better, a pull request.

