---
comments: true
layout: post
title: Nginx, Unicorn and multiple Rails apps
categories:
- en
---

It's really easy to make a rails app run using [unicorn](http://unicorn.bogomips.org/) + [nginx](http://nginx.org/en/), but when it comes to multiple apps, things get a lot harder, well, at least that's what I thought.

![image](/img/posts/unicorn.png)

What I want is to make the root (*"/"*) folder a place on the server where you can put **HTML** or **PHP** and use subdirectories like *"/app1"*, for exemple, to provide a rails app. Doing this correctly, makes a lot easier for me to deploy others apps using folders instead of http ports. It was really hard to find this better/easier way to run multiple rails applications and that's what makes me want to share with you.

In this post I'm going to show you how to make your server run rails on subdirectory. For this tutorial, I'm using **Ruby 2.0 **and** Rails 4.0**. I suppose you already have nginx and unicorn installed. So, let's get started!

In you nginx.conf file we are going to make nginx point to a unicorn socket:
<pre>
upstream unicorn_socket_for_myapp {
  server unix:/home/coffeencoke/apps/myapp/current/tmp/sockets/unicorn.sock fail_timeout=0;
}
</pre>

Then, with your server listening to port 80, add a location block that points to the subdirectory your rails app is (this code, must be inside server block):
<pre>
 location /myapp/ {
    try_files $uri @unicorn_proxy;
  }

  location @unicorn_proxy {
    proxy_pass http://unix:/home/coffeencoke/apps/myapp/current/tmp/sockets/unicorn.sock;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    proxy_redirect off;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
</pre>

Now you can just Unicorn as a Deamon:

`sudo unicorn_rails -c config/unicorn.rb -D`

The last thing to do, and the one I dug the most is to add a scope for your rails routes file, like this:

{% highlight ruby linenos %}
MyApp::Application.routes.draw do
  scope '/myapp' do
    root :to => 'welcome#home'

    # other routes are always inside this block
    # ...
  end
end
{% endhighlight %}

This way, your app will map a link `/myapp/welcome`, intead of just `/welcome`

<div class="alert"><b>Update 2013-08-13:</b> Better solution; Easier way to make assets visible; </div>

Also, we need to make rails see his in a subdirectory. At the end of your `production.rb` file, add:

{% highlight ruby linenos %}
config.relative_url_root = "/myapp"
{% endhighlight %}

So now our app opens using "/myapp" subdirectory, but, hey! Where's my assets? Well, rails still believe your assets are at "/assets" when they should be at "/myapp/assets". Let's solve this:

Into your `config/applcation.rb` file add:

{% highlight ruby linenos %}
config.assets.prefix = "/myapp/assets"
{% endhighlight %}

<div class="alert"><b>Update 2013-08-14:</b> Solution for assets to work when in production; </div>

If in production environment your css or js are not being found, maybe `bundle exec rake assets:precompile RAILS_RELATIVE_URL_ROOT=/mypapp` solves the problem.

Now we're done. :)

That was possible using this [source](http://coffeencoke.github.io/blog/2012/12/31/serving-rails-with-a-subdirectory-root-path/)