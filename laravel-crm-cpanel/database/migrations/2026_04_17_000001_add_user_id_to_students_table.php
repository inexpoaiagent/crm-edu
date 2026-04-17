<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('students')) {
            return;
        }
        Schema::table('students', function (Blueprint $table): void {
            if (!Schema::hasColumn('students', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('tenant_id');
                $table->unique('user_id', 'students_user_id_unique');
                $table->foreign('user_id', 'students_user_id_fk')->references('id')->on('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('students') || !Schema::hasColumn('students', 'user_id')) {
            return;
        }
        Schema::table('students', function (Blueprint $table): void {
            $table->dropForeign('students_user_id_fk');
            $table->dropUnique('students_user_id_unique');
            $table->dropColumn('user_id');
        });
    }
};
