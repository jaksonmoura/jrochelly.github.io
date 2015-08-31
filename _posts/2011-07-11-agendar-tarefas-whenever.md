---
comments: true
layout: post
title: "Agendar tarefas com whenever gem"
categories:
- br
---

A utilização de tarefas agendadas é bastante útil para, por exemplo, excluir logs a cada 15 dias, indexar mecanismos de busca e vários outros.

Quero mostrar pra vocês uma gema que estou utilizando no meu mais novo projeto, [Whenever](https://github.com/javan/whenever).

Do github:

> Whenever is a Ruby gem that provides a clear syntax for writing and deploying cron jobs.

Assim, você não precisa aprender ou colar toda vez que precisar de um Cron job.

Comparação:

Cron job

	0 23 1,15 * * /bin/bash -i -l -c ‘cd /home/jrochelly/Projetos/myapp && rails runner -e development MyModel.method » /home/jrochelly/Projetos/myapp/log/cron.log 2>&1’

Whenever

	every 1.minute do
        runner “MyModel.method”
	end 

Muito semelhante né?
Para instalar a gem siga os passos que estão [aqui](https://github.com/javan/whenever)! (Não vou reescrever o que está escrito =P )

Dica: Se quiser rodar um método de um Model, você precisa adicionar self.

Assim um método <b>def nome_metodo</b> fica <b>def self.nome_metodo</b>. Por quê?
Porque é necessário um class method ao invés de uma instância.

Eu bati cabeça nessa parte, pois nada é explicado nesse sentido no README da gema. A minha salvação foi quando pesquisava sobre o mesmo problema para a gem rufus-scheduler e encontrei [esse post](https://groups.google.com/forum/#!topic/rufus-ruby/BzSzC2X6XXc) no google groups.

UPDATE:

Caso você tenha algum problema como script/rails não funcionar, você adicionar as seguintes linhas no config/schedule.rb:

 	set :output, “#{path}/log/cron.log”
 	set :environment, ‘development’ # Para funcionar em desenvolvimento
 	job_type :runner, “cd :path && rails runner -e :environment :task :output”
 	set :job_template, “/bin/bash -i -l -c ‘:job’” 

Uma alternativa ao whenever é o [rufus-scheduler](https://github.com/jmettraux/rufus-scheduler/) que tem uma sintaxe similar e vale a pena dar uma conferida!

É isso pessoal, espero que esse post sirva de ajuda!