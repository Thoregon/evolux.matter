matter
======

UHandle persistent data & collections.

Implements building snapshots and implementing the queries from CQRS (Command Query Responsibility Seggregation)

* countable collections: can determine their size
* infinite collections: size is unknown

While the whole distributed system works with events to manipulate data, the local endpoints also do a retention 
of snapshots to support fast queries.

  
