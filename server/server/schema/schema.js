const Project = require("../models/Project");
const Client = require("../models/Client");
const { validateClientInput, validateProjectInput } = require("../validators");
const { handleError, NotFoundError, ValidationError } = require("../error");
const { authenticate, authorize } = require("../middleware/auth");
const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
} = require("graphql");

// Project Type
const ProjectType = new GraphQLObjectType({
  name: "Project",
  description: "Represents a project",
  fields: () => ({
    id: { type: GraphQLID, description: "The ID of the project" },
    name: { type: GraphQLString, description: "The name of the project" },
    description: {
      type: GraphQLString,
      description: "The description of the project",
    },
    status: { type: GraphQLString, description: "The status of the project" },
    client: {
      type: ClientType,
      description: "The client associated with the project",
      resolve(parent, args) {
        return Client.findById(parent.clientId);
      },
    },
  }),
});

// Client Type
const ClientType = new GraphQLObjectType({
  name: "Client",
  description: "Represents a client",
  fields: () => ({
    id: { type: GraphQLID, description: "The ID of the client" },
    name: { type: GraphQLString, description: "The name of the client" },
    email: { type: GraphQLString, description: "The email of the client" },
    phone: {
      type: GraphQLString,
      description: "The phone number of the client",
    },
    projects: {
      type: new GraphQLList(ProjectType),
      description: "List of projects for the client",
      resolve(parent, args) {
        return Project.find({ clientId: parent.id });
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  description: "Root Query",
  fields: {
    projects: {
      type: new GraphQLList(ProjectType),
      description: "List of all projects",
      resolve(parent, args) {
        return Project.find();
      },
    },
    project: {
      type: ProjectType,
      description: "Get a project by ID",
      args: { id: { type: GraphQLID, description: "ID of the project" } },
      resolve(parent, args) {
        return Project.findById(args.id)
          .then((project) => {
            if (!project) throw new NotFoundError("Project not found");
            return project;
          })
          .catch(handleError);
      },
    },
    clients: {
      type: new GraphQLList(ClientType),
      description: "List of all clients",
      resolve(parent, args) {
        return Client.find();
      },
    },
    client: {
      type: ClientType,
      description: "Get a client by ID",
      args: { id: { type: GraphQLID, description: "ID of the client" } },
      resolve(parent, args) {
        return Project.Client(args.id)
          .then((client) => {
            if (!client) throw new NotFoundError("Client not found");
            return client;
          })
          .catch(handleError);
      },
    },
  },
});

// Mutations
const mutation = new GraphQLObjectType({
  name: "Mutation",
  description: "Mutations",
  fields: {
    addClient: {
      type: ClientType,
      description: "Add a new client",
      args: {
        name: {
          type: GraphQLNonNull(GraphQLString),
          description: "Name of the client",
        },
        email: {
          type: GraphQLNonNull(GraphQLString),
          description: "Email of the client",
        },
        phone: {
          type: GraphQLNonNull(GraphQLString),
          description: "Phone number of the client",
        },
      },
      resolve(parent, args) {
        const { error } = validateClientInput(args);
        if (error) throw new ValidationError(error.details[0].message);

        const client = new Client({
          name: args.name,
          email: args.email,
          phone: args.phone,
        });
        return client.save().catch(handleError);
      },
    },
    deleteClient: {
      type: ClientType,
      description: "Delete a client by ID",
      args: {
        id: {
          type: GraphQLNonNull(GraphQLID),
          description: "ID of the client",
        },
      },
      resolve(parent, args) {
        // Project.find({ clientId: args.id }).then((projects) => {
        //   projects.forEach((project) => {
        //     project.remove();
        //   });
        // });
        // return Client.findByIdAndRemove(args.id);
        return Client.findByIdAndRemove(args.id)
          .then((client) => {
            if (!client) throw new NotFoundError("Client not found");
            return Project.deleteMany({ clientId: args.id }).then(() => client);
          })
          .catch(handleError);
      },
    },
    addProject: {
      type: ProjectType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) },
        status: {
          type: new GraphQLEnumType({
            name: "ProjectStatus",
            values: {
              new: { value: "Not Started" },
              progress: { value: "In Progress" },
              completed: { value: "Completed" },
            },
          }),
          defaultValue: "Not Started",
        },
        clientId: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        const project = new Project({
          name: args.name,
          description: args.description,
          status: args.status,
          clientId: args.clientId,
        });
        return project.save();
      },
    },
    deleteProject: {
      type: ProjectType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        return Project.findByIdAndRemove(args.id);
      },
    },
    updateProject: {
      type: ProjectType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: {
          type: new GraphQLEnumType({
            name: "ProjectStatusUpdate",
            values: {
              new: { value: "Not Started" },
              progress: { value: "In Progress" },
              completed: { value: "Completed" },
            },
          }),
        },
      },
      resolve(parent, args) {
        return Project.findByIdAndUpdate(
          args.id,
          {
            $set: {
              name: args.name,
              description: args.description,
              status: args.status,
            },
          },
          { new: true }
        );
      },
    },
  },
});

module.exports = new GraphQLSchema({ query: RootQuery, mutation });
