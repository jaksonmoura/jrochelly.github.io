---
comments: true
layout: post
date: 2014-05-17 22:06:00
title: "Elasticsearch: Busca e problemas com queries N+1"
categories:
- br
---

Geralmente quando temos alguma aplicação que precisa de busca, ela contem relacionamentos entre tabelas, como por exemplo uma App de Loja, onde você tem produto relacionado com categoria, fabricante, etc. Se usarmos o Elasticsearch na aplicação, é possível que o banco de dados sofra com **queries N + 1**. Podemos acabar com isso definindo alguns índices.

Imagine que temos uma aplicação de uma Livraria. Livros e autores estão inteiramente ligados por um relacionamento N - M. No model `book.rb` temos:

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

No controller temos:

{% highlight ruby linenos %}
def index
  @books = Book.search(params)
end
{% endhighlight %}

Como você pode ver acima, uma configuração normal da gem. Então na view, chamamos os autores e é aqui que mora o problema:

{% highlight ruby linenos %}
By <%= book.authors.map { |a| link_to a.name, author_path(a.id) }.join(', ').html_safe %>
{% endhighlight %}

A de chamada autores acima faz N + 1 queries, e é isso que queremos evitar:

<figure>
![image](/assets/img/posts/queries_n_1/rails_c_queries_n_1.png)
<figcaption>Rails console: Problema de queries N + 1</figcaption>
</figure>

## Solução

O que podemos fazer é adicionar um block com índices de autores, ficando assim:

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

Ainda no model, será necessário sobrescrever o método `to_indexed_json` para que possamos incluir autores:

{% highlight ruby linenos %}
def to_indexed_json
  to_json include: :authors
end
{% endhighlight %}

Também, não precisamos mais fazer o elasticsearch carregar a partir do banco (puxar informações como objetos), então podemos tirar o trecho `(load: true)` do método `self.search`.

Reidexamos tudo com o comando `rake environment tire:import CLASS='Book' FORCE=true`. E ao recarregar a página:

<figure>
![image](/assets/img/posts/queries_n_1/rails_c_ok.png)
<figcaption>Rails console: No loadings! Yay!</figcaption>
</figure>

Sem informações vindas do banco. Muito mais rápido! Espero que tenha ajudado. Se você conhece outra maneira, por favor, compartilhe.