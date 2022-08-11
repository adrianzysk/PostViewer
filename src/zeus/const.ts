/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
	Query:{
		albums:{
			options:"PageQueryOptions"
		},
		album:{

		},
		comments:{
			options:"PageQueryOptions"
		},
		comment:{

		},
		photos:{
			options:"PageQueryOptions"
		},
		photo:{

		},
		posts:{
			options:"PageQueryOptions"
		},
		post:{

		},
		todos:{
			options:"PageQueryOptions"
		},
		todo:{

		},
		users:{
			options:"PageQueryOptions"
		},
		user:{

		}
	},
	PageQueryOptions:{
		paginate:"PaginateOptions",
		slice:"SliceOptions",
		sort:"SortOptions",
		operators:"OperatorOptions",
		search:"SearchOptions"
	},
	PaginateOptions:{

	},
	SliceOptions:{

	},
	SortOptions:{
		order:"SortOrderEnum"
	},
	SortOrderEnum: true,
	OperatorOptions:{
		kind:"OperatorKindEnum"
	},
	OperatorKindEnum: true,
	SearchOptions:{

	},
	Album:{
		photos:{
			options:"PageQueryOptions"
		}
	},
	User:{
		posts:{
			options:"PageQueryOptions"
		},
		albums:{
			options:"PageQueryOptions"
		},
		todos:{
			options:"PageQueryOptions"
		}
	},
	Post:{
		comments:{
			options:"PageQueryOptions"
		}
	},
	Mutation:{
		createAlbum:{
			input:"CreateAlbumInput"
		},
		updateAlbum:{
			input:"UpdateAlbumInput"
		},
		deleteAlbum:{

		},
		createComment:{
			input:"CreateCommentInput"
		},
		updateComment:{
			input:"UpdateCommentInput"
		},
		deleteComment:{

		},
		createPhoto:{
			input:"CreatePhotoInput"
		},
		updatePhoto:{
			input:"UpdatePhotoInput"
		},
		deletePhoto:{

		},
		createPost:{
			input:"CreatePostInput"
		},
		updatePost:{
			input:"UpdatePostInput"
		},
		deletePost:{

		},
		createTodo:{
			input:"CreateTodoInput"
		},
		updateTodo:{
			input:"UpdateTodoInput"
		},
		deleteTodo:{

		},
		createUser:{
			input:"CreateUserInput"
		},
		updateUser:{
			input:"UpdateUserInput"
		},
		deleteUser:{

		}
	},
	CreateAlbumInput:{

	},
	UpdateAlbumInput:{

	},
	CreateCommentInput:{

	},
	UpdateCommentInput:{

	},
	CreatePhotoInput:{

	},
	UpdatePhotoInput:{

	},
	CreatePostInput:{

	},
	UpdatePostInput:{

	},
	CreateTodoInput:{

	},
	UpdateTodoInput:{

	},
	CreateUserInput:{
		address:"AddressInput",
		company:"CompanyInput"
	},
	AddressInput:{
		geo:"GeoInput"
	},
	GeoInput:{

	},
	CompanyInput:{

	},
	UpdateUserInput:{
		address:"AddressInput",
		company:"CompanyInput"
	},
	CacheControlScope: true,
	Upload: "String"
}

export const ReturnTypes: Record<string,any> = {
	cacheControl:{
		maxAge:"Int",
		scope:"CacheControlScope"
	},
	Query:{
		_:"Int",
		albums:"AlbumsPage",
		album:"Album",
		comments:"CommentsPage",
		comment:"Comment",
		photos:"PhotosPage",
		photo:"Photo",
		posts:"PostsPage",
		post:"Post",
		todos:"TodosPage",
		todo:"Todo",
		users:"UsersPage",
		user:"User"
	},
	AlbumsPage:{
		data:"Album",
		links:"PaginationLinks",
		meta:"PageMetadata"
	},
	Album:{
		id:"ID",
		title:"String",
		user:"User",
		photos:"PhotosPage"
	},
	User:{
		id:"ID",
		name:"String",
		username:"String",
		email:"String",
		address:"Address",
		phone:"String",
		website:"String",
		company:"Company",
		posts:"PostsPage",
		albums:"AlbumsPage",
		todos:"TodosPage"
	},
	Address:{
		street:"String",
		suite:"String",
		city:"String",
		zipcode:"String",
		geo:"Geo"
	},
	Geo:{
		lat:"Float",
		lng:"Float"
	},
	Company:{
		name:"String",
		catchPhrase:"String",
		bs:"String"
	},
	PostsPage:{
		data:"Post",
		links:"PaginationLinks",
		meta:"PageMetadata"
	},
	Post:{
		id:"ID",
		title:"String",
		body:"String",
		user:"User",
		comments:"CommentsPage"
	},
	CommentsPage:{
		data:"Comment",
		links:"PaginationLinks",
		meta:"PageMetadata"
	},
	Comment:{
		id:"ID",
		name:"String",
		email:"String",
		body:"String",
		post:"Post"
	},
	PaginationLinks:{
		first:"PageLimitPair",
		prev:"PageLimitPair",
		next:"PageLimitPair",
		last:"PageLimitPair"
	},
	PageLimitPair:{
		page:"Int",
		limit:"Int"
	},
	PageMetadata:{
		totalCount:"Int"
	},
	TodosPage:{
		data:"Todo",
		links:"PaginationLinks",
		meta:"PageMetadata"
	},
	Todo:{
		id:"ID",
		title:"String",
		completed:"Boolean",
		user:"User"
	},
	PhotosPage:{
		data:"Photo",
		links:"PaginationLinks",
		meta:"PageMetadata"
	},
	Photo:{
		id:"ID",
		title:"String",
		url:"String",
		thumbnailUrl:"String",
		album:"Album"
	},
	UsersPage:{
		data:"User",
		links:"PaginationLinks",
		meta:"PageMetadata"
	},
	Mutation:{
		_:"Int",
		createAlbum:"Album",
		updateAlbum:"Album",
		deleteAlbum:"Boolean",
		createComment:"Comment",
		updateComment:"Comment",
		deleteComment:"Boolean",
		createPhoto:"Photo",
		updatePhoto:"Photo",
		deletePhoto:"Boolean",
		createPost:"Post",
		updatePost:"Post",
		deletePost:"Boolean",
		createTodo:"Todo",
		updateTodo:"Todo",
		deleteTodo:"Boolean",
		createUser:"User",
		updateUser:"User",
		deleteUser:"Boolean"
	}
}

export const Ops = {
query: "Query" as const,
	mutation: "Mutation" as const
}