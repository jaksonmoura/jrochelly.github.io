---
comments: true
layout: post
date: 2014-05-17 22:06:00
title: "Elasticsearch: Search and N+1 queries' problems"
categories:
- en
---
Usually when we have some app that needs a search feature, it contains relationships between tables, for example, a Store app, where you have product related to category, manufacturer, so on and so forth. It's possible the database to suffer **N+1 queries** by using just simple searches with Elasticsearch or any database. But we can get rid of this with indexes.

Picture we have a Library application. Books and authors are fully bonded in a many-to-many relationship. In `book.rb` model we have:

{% highlight ruby linenos %}
class Book < ActiveRecord::Base
  has_and_belongs_to_many :authors

  include Tire::Model::Search
  include Tire::Model::Callbacks

  mapping do
    indexes :id
    indexes :title, analyzer: 'snowball'
    indexes :summary, analyzer: 'snowball'
    indexes :released_at, type: 'date'
    indexes :edition
    indexes :isbn, analyzer: 'keyword'
  end

  def self.search(params)
    tire.search(load: true) do
      query { string params[:query] } if params[:query].present?
    end
  end
  
end
{% endhighlight %}

In the controller:

{% highlight ruby linenos %}
def index
  @books = Book.search(params)
end
{% endhighlight %}

As you can see above, a normal gem setup. So in view we call authors and there's where the issue lies:

{% highlight ruby linenos %}
By <%= book.authors.map { |a| link_to a.name, author_path(a.id) }.join(', ').html_safe %>
{% endhighlight %}

The above author call result in a N+1 queries we want to avoid.

<figure>
![image](/assets/img/posts/queries_n_1/rails_c_queries_n_1.png)
<figcaption>Rails console: N+1 queries issue</figcaption>
</figure>

## Solution

What we may do is to add a block with authors indexes, leaving it like this:

{% highlight ruby linenos %}
mapping do
    indexes :id
    indexes :title, analyzer: 'snowball'
    indexes :summary, analyzer: 'snowball'
    indexes :released_at, type: 'date'
    indexes :edition
    indexes :isbn, analyzer: 'keyword'
    indexes :author do
      indexes :id
      indexes :name
    end
  end
{% endhighlight %}

Still in the model, it will be needed to overwrite the `to_indexed_json` method so we can include the authors:

{% highlight ruby linenos %}
def to_indexed_json
  to_json include: :authors
end
{% endhighlight %}

Also, there's no need to make elasticsearch load from the db anymore. Then let's remove the `(load: true)` chunk of `self.search` method.

Reindex everything using the command `rake environment tire:import CLASS='Book' FORCE=true`. After reloading the page::

<figure>
![image](/assets/img/posts/queries_n_1/rails_c_ok.png)
<figcaption>Rails console: No loadings! Yay!</figcaption>
</figure>

No data loaded from db. Much faster! I hope this has helped.
If you know another way, please, share with us.