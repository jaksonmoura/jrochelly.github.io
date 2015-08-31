---
comments: true
layout: post
title: Conheça Can_be_flagged gem
categories:
- br
---

Gostaria de apresentar a vocês a Gem [can_be_flagged](https://github.com/danhixon/can_be_flagged).

Ela permite que você tenha uma opção como “sinalizar” um conteúdo. É bastante útil quando se trata de conteúdo vindo dos usuários do sistema, assim, os próprios usuários podem sinalizar como spam ou algo parecido.

Para instalar é muito fácil:

rode <i>gem install can_be_flagged</i> ou então, adicione <i>gem ‘can_be_flagged’</i> para o arquivo Gemfile e então rode “bundle install” 

Depois disso, você já pode gerar sua model:

Rails 3:
    rails g flags

Em seguida migre seu banco de dados:

    rake db:migrate

Sua configuração é bem simples, dá uma olhada:

Na model Post: 

    class Post < ActiveRecord::Base	
        can_be_flagged
    end
é também interessante adicionar uma coluna para contagem de flags:

    add_column :posts, :flags_count, :integer
 por último, edite o model Flag para:

    class Flag < ActiveRecord::Base
        belongs_to :flaggable, :polymorphic=>true, :counter_cache=>true
    end
A implementação na model fica por sua conta, veja o exemplo que fiz:


    class PropertiesController < ApplicationController
      def denunciar
        @last_user_flag = Flag.where("user_id = ? AND flaggable_id = ?", current_user.id, params[:pid]).last
        if @last_user_flag.nil?
          @flag = Flag.create(:comment => "I am offended by that!", :flaggable_id => params[:pid], :user_id => current_user.id)
          @flag.save
          redirect_to :back, :notice => "Obrigado por colaborar!"
        else
          @last_user_flag.destroy
          redirect_to :back, :notice => "Sua denuncia foi exluída!"
        end
      end
    end
Para mais detalhes de implementação, clique aqui!
Espero que tenha sido útil! Em breve posto mais! Abraços!