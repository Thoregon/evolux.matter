ToDo
====

Usage

Set an Object:

    await matter.anchor.set(obj)
    matter.anchor = obj;
    
Add an Object to a collection

    await matter.collection.add(obj);

Object/Collection exists

    let exists = await matter.anchor.has('a.b.c.');
    
Get an Object/Collection. This objects are immutable. Can only be modified with the 'set()' API.
Returns bare object without proxy. Referenced objects has to be dereferenced with the matter API as well!

    let obj = await matter.anchor.val;
    

Matter management 

    const Matter = universe.Matter
    Matter.is(obj)      // check if the object is persistent
    Matter.soul(obj)    // get the UID of the object
    
Tags:

    matter.tags
    
    matter.tags.mytag

Examples

    universe.matter.mydata = { a: 'A', b: { b: 'B' } };    // creates/updates a Object/Map/Tree
        // because it runs async, first a 'placeholder' will be created
    lett mydata = await universe.matter.mydata.val;
    universe.matter.otherdata = { c: 'C', a: mydata }; // ref to other object
    universe.matter.mydata.c = await universe.matter.otherdata.val // circular reference
    
    await universe.matter.has('mydata.c.a.b');

    await universe.matter.mycollection = [mydata];     // creates a new collection if it does not exist
    await universe.matter.mycollection.add(mydata);    // creates a new collection if it does not exist
    await universe.matter.mycollection.find()
    await universe.matter.mycollection.forEach()
    --> implement Iterator
        
    import mydata from 'universe.matter.mydata'
    import { c } from 'universe.matter.mydata' 

- scope
    - build if missing on sovereign node -> store in CWD '.scope'
    - supply scope to reliant nodes -> 'universe.scope' 

- immed (realtime) sync 
    - for realtime collaboration
    - maybe introduce controls in addition to commands

- secure content
    - permissions
    
- API for collection management
    - async commands
    
- yaml collection declaration
