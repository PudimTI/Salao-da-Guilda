<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ReportResource\Pages;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use BackedEnum;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use UnitEnum;

class ReportResource extends Resource
{
    protected static ?string $model = Report::class;

    protected static ?string $navigationLabel = 'Denúncias';

    protected static ?string $modelLabel = 'Denúncia';

    protected static ?string $pluralModelLabel = 'Denúncias';

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-exclamation-triangle';

    protected static ?int $navigationSort = 3;

    protected static UnitEnum|string|null $navigationGroup = 'Administração';

    public static function form(Schema $schema): Schema
    {
        $statusOptions = config('reports.status_labels');

        return $schema
            ->columns(2)
            ->components([
                Placeholder::make('reporter_display_name')
                    ->label('Denunciante')
                    ->content(fn (?Report $record): string => $record?->reporter?->display_name ?? $record?->reporter?->handle ?? '—'),
                Placeholder::make('target_label')
                    ->label('Alvo')
                    ->content(fn (?Report $record): string => match ($record?->target_type) {
                        'user' => __('Usuário #:id (:name)', ['id' => $record?->target_id, 'name' => $record?->target?->display_name ?? 'desconhecido']),
                        'post' => __('Post #:id', ['id' => $record?->target_id]),
                        'comment' => __('Comentário #:id', ['id' => $record?->target_id]),
                        'campaign' => __('Campanha #:id', ['id' => $record?->target_id]),
                        default => (string) $record?->target_id,
                    }),
                Placeholder::make('reason_text')
                    ->label('Motivo')
                    ->content(fn (?Report $record): string => $record?->reason_text ?? '—')
                    ->columnSpanFull(),
                Select::make('status')
                    ->label('Status da denúncia')
                    ->options($statusOptions)
                    ->required()
                    ->columnSpanFull(),
                Select::make('target_user_status')
                    ->label('Status do usuário alvo')
                    ->options([
                        'active' => 'Ativo',
                        'suspended' => 'Suspenso',
                        'banned' => 'Banido',
                    ])
                    ->helperText('Opcional: atualiza o status do usuário denunciado.')
                    ->visible(fn (?Report $record) => $record?->target_type === 'user')
                    ->columnSpanFull(),
                Textarea::make('resolution_notes')
                    ->label('Notas de resolução')
                    ->rows(4)
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable()
                    ->searchable(),
                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        Report::STATUS_OPEN => 'warning',
                        Report::STATUS_UNDER_REVIEW => 'info',
                        Report::STATUS_RESOLVED => 'success',
                        Report::STATUS_DISMISSED => 'gray',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => config('reports.status_labels.' . $state, $state)),
                TextColumn::make('target_type')
                    ->label('Alvo')
                    ->formatStateUsing(fn (string $state): string => ucfirst($state))
                    ->searchable(),
                TextColumn::make('reporter.display_name')
                    ->label('Denunciante')
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('target_summary')
                    ->label('Denunciado')
                    ->getStateUsing(function (Report $record): string {
                        if ($record->target_type === 'user' && $record->target) {
                            return $record->target->display_name
                                ?? $record->target->handle
                                ?? (string) $record->target_id;
                        }

                        return match ($record->target_type) {
                            'post' => sprintf('Post #%d', $record->target_id),
                            'comment' => sprintf('Comentário #%d', $record->target_id),
                            'campaign' => $record->target?->name
                                ?? sprintf('Campanha #%d', $record->target_id),
                            default => (string) $record->target_id,
                        };
                    })
                    ->toggleable(),
                TextColumn::make('handledBy.display_name')
                    ->label('Responsável')
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('created_at')
                    ->label('Data')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('Status')
                    ->options(config('reports.status_labels')),
                SelectFilter::make('target_type')
                    ->label('Tipo do alvo')
                    ->options(collect(config('reports.targets'))
                        ->map(fn ($class, $key) => ucfirst($key))
                        ->all()),
            ])
            ->defaultSort('created_at', 'desc')
            ->modifyQueryUsing(function (Builder $query): Builder {
                return $query->with(['reporter', 'handledBy', 'target']);
            })
            ->recordUrl(fn (Report $record) => Pages\EditReport::getUrl(['record' => $record]));
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListReports::route('/'),
            'edit' => Pages\EditReport::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return (string) Report::query()->where('status', Report::STATUS_OPEN)->count();
    }

    public static function shouldRegisterNavigation(): bool
    {
        return auth()->user()?->isModerator() ?? false;
    }

    public static function canViewAny(): bool
    {
        return auth()->user()?->isModerator() ?? false;
    }

    public static function canView(?Model $record = null): bool
    {
        return auth()->user()?->isModerator() ?? false;
    }

    public static function canEdit(?Model $record = null): bool
    {
        return auth()->user()?->isModerator() ?? false;
    }

    public static function canDelete(?Model $record = null): bool
    {
        return false;
    }

    public static function canCreate(): bool
    {
        return false;
    }
}


