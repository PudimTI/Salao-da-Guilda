<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CampaignResource\Pages;
use App\Filament\Resources\CampaignResource\Schemas\CampaignForm;
use App\Filament\Resources\CampaignResource\Schemas\CampaignInfolist;
use App\Filament\Resources\CampaignResource\Tables\CampaignsTable;
use App\Models\Campaign;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class CampaignResource extends Resource
{
    protected static ?string $model = Campaign::class;

    protected static ?string $navigationLabel = 'Campanhas';

    protected static ?string $modelLabel = 'Campanha';

    protected static ?string $pluralModelLabel = 'Campanhas';

    protected static ?int $navigationSort = 1;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-flag';

    protected static UnitEnum|string|null $navigationGroup = 'Moderação';

    public static function form(Schema $schema): Schema
    {
        return CampaignForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return CampaignInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CampaignsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCampaigns::route('/'),
            'create' => Pages\CreateCampaign::route('/create'),
            'view' => Pages\ViewCampaign::route('/{record}'),
            'edit' => Pages\EditCampaign::route('/{record}/edit'),
        ];
    }
}
