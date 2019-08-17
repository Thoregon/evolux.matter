matter
======

UHandle persistent data & collections.

Implements building snapshots and implementing the queries from CQRS (Command Query Responsibility Seggregation)

* countable collections: can determine their size
* infinite collections: size is unknown

While the whole distributed system works with events to manipulate data, the local endpoints also do a retention 
of snapshots to support fast queries.

Query API's
- XPath
- fluent API
- (SQL derivate will follow)

##Entity

- Metadata
    * schema, ....
    * provides validity checks
    * provides commands/actions
    * provides combining rules
    * provides view categories
    
- Statusdata
    * synchronized
    * all kind of timestamps, created, modified, deleted, synchronized
        * extendable e.g. todo/open, inprogress/edit, processed/done, discarded/canceled, resumed/reopened/continued, archived 
    * provides valid commands/actions
        * statemachine

- Transactions
    * 
