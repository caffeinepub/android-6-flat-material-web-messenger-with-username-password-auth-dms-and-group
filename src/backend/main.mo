import List "mo:core/List";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Type Definitions
  type Message = {
    sender : Principal;
    content : Text;
    timestamp : Int;
  };

  type GroupChat = {
    id : Text;
    name : Text;
    creator : Principal;
    participants : List.List<Principal>;
    messages : List.List<Message>;
  };

  public type UserProfile = {
    username : Text;
    displayName : Text;
  };

  // Comparison function for (Principal, Principal) tuples
  module TupleUtil {
    public func compare(tuple1 : (Principal, Principal), tuple2 : (Principal, Principal)) : Order.Order {
      switch (Principal.compare(tuple1.0, tuple2.0)) {
        case (#equal) { Principal.compare(tuple1.1, tuple2.1) };
        case (order) { order };
      };
    };
  };

  // User Profile Management
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // DM (Direct Messages) Management
  let directMessages = Map.empty<(Principal, Principal), List.List<Message>>();

  // Group Chat Management
  let groupChats = Map.empty<Text, GroupChat>();

  // Messaging Functions
  public shared ({ caller }) func sendDirectMessage(recipient : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let key = if (caller.toText() < recipient.toText()) {
      (caller, recipient : Principal);
    } else {
      (recipient : Principal, caller);
    };

    let newMessage : Message = {
      sender = caller;
      content;
      timestamp = 0;
    };

    let existingMessages = switch (directMessages.get(key)) {
      case (null) { List.empty<Message>() };
      case (?messages) { messages };
    };

    existingMessages.add(newMessage);
    directMessages.add(key, existingMessages);
  };

  public query ({ caller }) func getDirectMessages(user : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch messages");
    };

    let key = if (caller.toText() < user.toText()) { (caller, user : Principal) } else {
      (user : Principal, caller);
    };

    switch (directMessages.get(key)) {
      case (null) { [] };
      case (?messages) { messages.toArray() };
    };
  };

  public shared ({ caller }) func createGroupChat(name : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create group chats");
    };

    let groupId = name.concat(caller.toText());
    let groupChat : GroupChat = {
      id = groupId;
      name;
      creator = caller;
      participants = List.singleton(caller);
      messages = List.empty<Message>();
    };

    groupChats.add(groupId, groupChat);
    groupId;
  };

  public shared ({ caller }) func addParticipant(groupId : Text, participant : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add participants");
    };

    let groupChat = switch (groupChats.get(groupId)) {
      case (null) { Runtime.trap("Group chat not found") };
      case (?chat) { chat };
    };

    if (caller != groupChat.creator) {
      Runtime.trap("Unauthorized: Only group chat creator can add participants");
    };

    groupChat.participants.add(participant);
    groupChats.add(groupId, groupChat);
  };

  public shared ({ caller }) func sendGroupMessage(groupId : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let groupChat = switch (groupChats.get(groupId)) {
      case (null) { Runtime.trap("Group chat not found") };
      case (?chat) { chat };
    };

    if (not groupChat.participants.values().any(func(participant) { participant == caller })) {
      Runtime.trap("Unauthorized: Only group chat members can send messages");
    };

    let newMessage : Message = {
      sender = caller;
      content;
      timestamp = 0;
    };

    groupChat.messages.add(newMessage);
    groupChats.add(groupId, groupChat);
  };

  public query ({ caller }) func getGroupMessages(groupId : Text) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch messages");
    };

    let groupChat = switch (groupChats.get(groupId)) {
      case (null) { Runtime.trap("Group chat not found") };
      case (?chat) { chat };
    };

    if (not groupChat.participants.values().any(func(participant) { participant == caller })) {
      Runtime.trap("Unauthorized: Only group chat members can fetch messages");
    };
    groupChat.messages.toArray();
  };
};
