# ITP Administration Platform

Originally designed for just the new ITP Voice, ITP Admin Platform will now perform all duties for ITP including but not limited to:

-Billing
-Charging
-Managing Services
-ITP Voice
-ITP Fiber Provisioning
-More to come


#Folder Structure

/Asterisk -- Asterisk config files for all asterisk servers

/Kamailio -- Kamailio config files for all KM servers

/ari      -- node Asterisk ARI files for App servers

/apps      -- node files for all ITP modules (Fiber, Voice, Cloud, etc.)


# ITP-Voice-Platform


ITP Voice Platform will utilize open source technologies to build a cluster of Asterisk servers that is both scalable and resilient.

This cluster will consist of:


-------Kamailio------
          |
          |
          |
  -----Asterisk----
          |
          |
          |
---Asterisk ARI Engine--




Kamailio will be responsible for registering SIP users and load balancing between itself using DNS SRV records.

Kamailio will then load balance any calls (extension to extension, outgoing, inbound) to the Asterisk Servers.

Asterisk will simply hand off ANY call to the ARI Engine using Statsis. All of the business logic will be handled within the Asterisk ARI Engine using noseJS. This includes all Class 5 features such as ACD Queues, Hunt Groups, Call Forwarding, etc.
The hand off to the ARI engine will use a message bus, we will use rabbitmq for load balancing accross different ARI engines (servers).

Finally, all events will be logged in a CEL like structure for CDR Reports and Call Center statistics.




FEATURES:

-ACD Queues (Agent Login/Logout or Static Agents)

-Call Parking

-Time Conditions w/ Override code

-Direct DIDs to each extension

-IVR

-Ring Groups 

