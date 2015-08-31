---
comments: true
layout: post
title: Rails, BDs e seu problemas
categories:
- br
---

Nesses últimos dias, tentei instalar um banco de dados no lugar do SQLite, Primeiramente o PostgreSQL, sem sucesso, pois os drives para rails simplesmente não instalavam e os que instalavam não conseguia ativar sua execução. Mudei para o MySQL, não consegui e não faço ideia de por que não.

Nisso tentei mudei o projeto para o Windows 7, e consegui, depois de muita peleja, instalar o MySQL e seu driver.

Depois de ter conseguido, pensei, se consegui no Windows, consigo no Linux, e lá fui eu tentar. Por incrível que parece, ele aceitou numa boa.

O meu erro foi ter usado o adapter configurado para mysql, sendo que o certo é usa-lo com mysql2. Tive esse problema pois o projeto foi começado com o SQLite, e não sabia os termos corretos para configurar o MySQL.

E O PostgreSQL? Não consegui, o ruby-pg que é padrão, nem instala. Aí força a amizade!