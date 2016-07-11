create table if not exists person (
	id serial primary key,
	name varchar(100)
);

truncate person restart identity;

insert into person (name) values ('The Dude');
