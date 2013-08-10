---
comments: true
layout: post
title: Nginx, Unicorn and multiple Rails apps
---

###It's really easy to make a rails app run using [unicorn](http://unicorn.bogomips.org/) + [nginx](http://nginx.org/en/), but when it comes to multiple apps, things get a lot harder, well, at least that's what I thought.

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

<pre rel="Ruby">
MyApp::Application.routes.draw do
  scope '/myapp' do
    root :to => 'welcome#home'
    
    # other routes are always inside this block
    # ...
  end
end
</pre>

This way, your app will map a link `/myapp/welcome`, intead of just `/welcome`

##But there's a even better way
###Well, the above will work on production server, but what about development? Are you going to develop normally then on deployment you change your rails config? For every single app? That's not needed.

So, you need to create a new module that we are going to put at `lib/route_scoper.rb` and in your routes.rb do this:

<pre rel="Ruby">
require_relative '../lib/route_scoper'
 
MyApp::Application.routes.draw do
  scope RouteScoper.root do
    root :to => 'welcome#home'
    
    # other routes are always inside this block
    # ...
  end
end
</pre>
On the module we've created, put the following lines:

<pre rel="Ruby">
require 'rails/application'
 
module RouteScoper
  def self.root
    Rails.application.config.root_directory
  rescue NameError
    '/'
  end
end
</pre>

What we are doing is to see if the root directory is specified, if so use it, otherwise, got to "/". Now we just need to point the root directory on <code>config/enviroments/production.rb</code>:

<pre rel="Ruby">
MyApp::Application.configure do
  # Contains configurations for the production environment
  # ...
  
  # Serve the application at /myapp
  config.root_directory = '/myapp'
end
</pre>

In <code>config/enviroments/development.rb</code> I do not specify the <code>config.root_directory</code>. This way it uses the normal url root.

That was possible using this [source](http://coffeencoke.github.io/blog/2012/12/31/serving-rails-with-a-subdirectory-root-path/)








