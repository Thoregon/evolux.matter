matter
======

Materializes data as first-class resources (members) defined with schema and distributed domain driven design (tru4D)
Handle persistent data & collections. Creates the illusion of an in-memory always on collection.
Includes also stream sources like files and even live streams. 
Use 'matter' also for file storage, you get a truCloud. 

Implements building snapshots and implementing the queries from CQRS (Command Query Responsibility Seggregation)

* countable collections: can determine their size
* infinite collections: size is unknown

While the whole distributed system works with events to manipulate data, the local endpoints also do a retention 
of snapshots to support fast queries.

Allow endpoints to defined their context, to cache and store data which always needed and also probably will be needed.
E.g. mobile device from salesmen stores customer data the salesmen is responsible for and article data his customers
normaly orders, but may store all article data when the salesman often is offline. 
Data that is not stored locally can still be retrieved at any time. The most recent snapshot is loaded, events not yet 
applied are applied and chached locally.

##Identifiers

Except value objects, each instance automatically will receive an identifier (key) which will be stored in the property '_id';

Value objects are no singletons! The identity check may fail!  

##Query API's
- XPath
- fluent API
    - from(collection)
    - select(entity)
    - query language
    - then() 
    - observe()
    - provide an array with the current content (window/view): target() / mirror() / map() / delegate() / surrogate() / projection()
    - Interactive features
        - filter(InteractiveFilter)
        - (display) window size
        - prev() and next()
- JSON (simmilar to mongoDB)
    - find({});
- (SQL derivate will follow)

- group/aggregate queries

- proxy for each items

##Entity

- Metadata
    * schema, ....
        * indices for faster queries
    * provides validity checks
    * provides commands/actions
    * provides combining rules
    * provides view categories
    * mixins with calculated properties
   
    
- Statusdata
    * synchronized
    * all kind of timestamps, created, modified, deleted, synchronized
        * extendable e.g. todo/open, inprogress/edit, processed/done, discarded/canceled, resumed/reopened/continued, archived 
    * provides valid commands/actions
        * statemachine

- Transactions
    * 
