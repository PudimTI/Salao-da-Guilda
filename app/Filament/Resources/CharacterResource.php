<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CharacterResource\Pages;
use App\Models\Character;
use Filament\Resources\Resource;

class CharacterResource extends Resource
{
    protected static ?string $model = Character::class;

    protected static ?string $navigationLabel = 'Personagens';

    protected static ?string $modelLabel = 'Personagem';

    protected static ?string $pluralModelLabel = 'Personagens';

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
