import { Component } from "@angular/core";
import Dexie from "dexie";
import "dexie-observable";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  name = "Angular";

  constructor() {
    interface Friend {
      id?: number;
      name?: string;
      age?: number;
    }

    //
    // Declare Database
    //
    class FriendDatabase extends Dexie {
      public friends!: Dexie.Table<Friend, number>; // id is number in this case

      public constructor() {
        super("FriendDatabase2");
        this.version(1).stores({
          friends: "++id,name,age"
        });

        //this.version(2).stores({});
      }
    }

    const db = new FriendDatabase();

    db.on("changes", function(changes) {
      changes.forEach(function(change) {
        switch (change.type) {
          case 1: // CREATED
            console.log("An object was created: " + JSON.stringify(change.obj));
            break;
          case 2: // UPDATED
            console.log(
              "An object with key " +
                change.key +
                " was updated with modifications: " +
                JSON.stringify(change.mods)
            );
            break;
          case 3: // DELETED
            console.log(
              "An object was deleted: " + JSON.stringify(change.oldObj)
            );
            break;
        }
      });
    });

    db.transaction("rw", db.friends, async () => {
      // Make sure we have something in DB:
      const id = await db.friends.add({ name: "Josephine", age: 21 });

      console.log(`Addded friend with id ${id}`);

      // Query:
      const youngFriends = await db.friends
        .where("age")
        .below(25)
        .toArray();

      // Show result:
      console.log("Items in db: " + youngFriends.length);
    }).catch(e => {
      console.error(e.stack || e);
    });
  }
}
