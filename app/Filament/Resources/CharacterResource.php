<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CharacterResource\Pages;
use App\Filament\Resources\CharacterResource\Schemas\CharacterForm;
use App\Filament\Resources\CharacterResource\Schemas\CharacterInfolist;
use App\Filament\Resources\CharacterResource\Tables\CharactersTable;
use App\Models\Character;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class CharacterResource extends Resource
{
    protected static ?string $model = Character::class;

    protected static ?string $navigationLabel = 'Personagens';

    protected static ?string $modelLabel = 'Personagem';

    protected static ?string $pluralModelLabel = 'Personagens';

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-user-group';

    protected static UnitEnum|string|null $navigationGroup = 'Moderação';

    public static function form(Schema $schema): Schema
    {
        return CharacterForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return CharacterInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CharactersTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCharacters::route('/'),
            'create' => Pages\CreateCharacter::route('/create'),
            'view' => Pages\ViewCharacter::route('/{record}'),
            'edit' => Pages\EditCharacter::route('/{record}/edit'),
        ];
    }
}
