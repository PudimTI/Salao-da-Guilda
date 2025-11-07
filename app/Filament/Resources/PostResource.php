<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PostResource\Pages;
use App\Filament\Resources\PostResource\Schemas\PostForm;
use App\Filament\Resources\PostResource\Schemas\PostInfolist;
use App\Filament\Resources\PostResource\Tables\PostsTable;
use App\Models\Post;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class PostResource extends Resource
{
    protected static ?string $model = Post::class;

    protected static ?string $navigationLabel = 'Posts';

    protected static ?string $modelLabel = 'Post';

    protected static ?string $pluralModelLabel = 'Posts';

    protected static ?int $navigationSort = 4;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-document-text';

    protected static UnitEnum|string|null $navigationGroup = 'Moderação';

    public static function form(Schema $schema): Schema
    {
        return PostForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return PostInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PostsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPosts::route('/'),
            'create' => Pages\CreatePost::route('/create'),
            'view' => Pages\ViewPost::route('/{record}'),
            'edit' => Pages\EditPost::route('/{record}/edit'),
        ];
    }

    public static function shouldRegisterNavigation(): bool
    {
        return auth()->user()?->isModerator() ?? false;
    }
}

