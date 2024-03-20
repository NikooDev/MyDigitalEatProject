create table cards
(
    id          int auto_increment
        primary key,
    description varchar(150) not null
);

create index cards_id_index
    on cards (id);

create table dishes
(
    id      int auto_increment
        primary key,
    card_id int         not null,
    name    varchar(30) not null,
    price   int         not null,
    constraint dishes_cards_id_fk
        foreign key (card_id) references cards (id)
            on delete cascade
);

create index dishes_id_index
    on dishes (id);

create table menus
(
    id          int auto_increment
        primary key,
    card_id     int          not null,
    name        varchar(30)  not null,
    price       int          not null,
    description varchar(150) not null,
    constraint menus_cards_id_fk
        foreign key (card_id) references cards (id)
            on delete cascade
);

create index menus_id_index
    on menus (id);

create table menus_dishes
(
    menu_id  int not null,
    dishe_id int not null,
    constraint menus_dishes_dishes_id_fk
        foreign key (dishe_id) references dishes (id)
            on delete cascade,
    constraint menus_dishes_menus_id_fk
        foreign key (menu_id) references menus (id)
            on delete cascade
);

create table users
(
    id         int auto_increment
        primary key,
    email      varchar(512)                                   not null,
    password   varchar(30)                                    not null,
    name       varchar(255)                                   not null,
    address    varchar(255)                                   not null,
    phone      int                                            not null,
    role       enum ('CUSTOMER', 'DELIVERYMAN', 'RESTAURANT') not null,
    created_at datetime                                       not null,
    updated_at datetime                                       not null,
    constraint users_pk_2
        unique (email)
);

create table customers
(
    id      int auto_increment
        primary key,
    user_id int not null,
    constraint customers_users_id_fk
        foreign key (user_id) references users (id)
            on delete cascade
);

create index customers_id_index
    on customers (id);

create table deliverymans
(
    id      int auto_increment
        primary key,
    user_id int                                              not null,
    status  enum ('AVAILABLE', 'UNAVAILABLE', 'ON_DELIVERY') not null,
    constraint deliverymans_users_id_fk
        foreign key (user_id) references users (id)
            on delete cascade
);

create index deliverymans_id_index
    on deliverymans (id);

create table restaurants
(
    id          int auto_increment
        primary key,
    user_id     int          not null,
    card_id     int          not null,
    description varchar(150) not null,
    constraint restaurants_cards_id_fk
        foreign key (card_id) references cards (id)
            on delete cascade,
    constraint restaurants_users_id_fk
        foreign key (user_id) references users (id)
            on delete cascade
);

create table deliveries
(
    id             int auto_increment
        primary key,
    customer_id    int                                        not null,
    deliveryman_id int                                        not null,
    restaurant_id  int                                        not null,
    status         enum ('DELIVERED', 'PENDING', 'CANCELLED') not null,
    created_at     datetime                                   not null,
    constraint orders_customers_id_fk
        foreign key (customer_id) references customers (id)
            on delete cascade,
    constraint orders_deliverymans_id_fk
        foreign key (deliveryman_id) references deliverymans (id)
            on delete cascade,
    constraint orders_restaurants_id_fk
        foreign key (restaurant_id) references restaurants (id)
            on delete cascade
);

create index orders_id_index
    on deliveries (id);

create table orders_deliveries
(
    delivery_id int not null,
    menu_id     int not null,
    dishe_id    int not null,
    constraint orders_deliveries_deliveries_id_fk
        foreign key (delivery_id) references deliveries (id)
            on delete cascade,
    constraint orders_deliveries_dishes_id_fk
        foreign key (dishe_id) references dishes (id)
            on delete cascade,
    constraint orders_deliveries_menus_id_fk
        foreign key (menu_id) references menus (id)
            on delete cascade
);

create index restaurants_id_index
    on restaurants (id);

create index users_id_index
    on users (id);